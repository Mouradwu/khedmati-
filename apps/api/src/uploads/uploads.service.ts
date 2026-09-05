import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as sharp from "sharp";
import { randomUUID } from "crypto";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 Mo avant compression (section 39)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours (bucket prive, section 39)

/**
 * Stockage des photos (profil, galerie artisan, pieces jointes de demande —
 * sections 4, 6). Le bucket Railway est prive : on stocke uniquement la CLE
 * de l'objet en base (dans le champ historique "url" des modeles existants,
 * pour eviter une migration), et on genere une URL signee a la lecture,
 * jamais stockee telle quelle (elle expire).
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3: S3Client;
  private bucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET || "";

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      this.logger.warn(
        "Variables S3_* manquantes — l'upload de photos ne fonctionnera pas tant qu'elles ne sont pas configurees.",
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: false,
      credentials: { accessKeyId: accessKeyId ?? "", secretAccessKey: secretAccessKey ?? "" },
    });
  }

  /**
   * Compresse/redimensionne (section 4, 6 : "eviter des fichiers
   * inutilement lourds") puis televerse. Retourne la CLE de l'objet
   * (jamais l'URL directe, le bucket est prive).
   */
  async uploadImage(buffer: Buffer, mimetype: string, folder: string): Promise<string> {
    if (!ALLOWED_MIME.includes(mimetype)) {
      throw new BadRequestException("Format d'image non autorisé (jpeg, png, webp ou heic uniquement).");
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
      throw new BadRequestException("Image trop volumineuse (8 Mo maximum).");
    }

    let processed: Buffer;
    try {
      processed = await sharp(buffer)
        .rotate() // corrige l'orientation EXIF (photos prises au telephone)
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
    } catch {
      throw new BadRequestException("Fichier image invalide ou corrompu.");
    }

    const key = `${folder}/${randomUUID()}.jpg`;
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: processed,
          ContentType: "image/jpeg",
        }),
      );
    } catch (err) {
      this.logger.error(`Echec upload S3: ${(err as Error).message}`);
      throw new InternalServerErrorException("Impossible d'enregistrer l'image pour le moment.");
    }

    return key;
  }

  async deleteImage(key: string): Promise<void> {
    if (!key || key.startsWith("http")) return; // anciennes valeurs eventuelles, on ignore
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      this.logger.warn(`Echec suppression S3 (${key}): ${(err as Error).message}`);
    }
  }

  /**
   * Genere une URL signee temporaire pour une cle donnee. Si la valeur
   * stockee est deja une URL complete (http...), la renvoie telle quelle —
   * compatibilite avec d'eventuelles anciennes donnees/logos de marque
   * servis depuis /public plutot que le bucket.
   */
  async getSignedUrl(key: string | null | undefined): Promise<string | null> {
    if (!key) return null;
    if (key.startsWith("http")) return key;
    try {
      return await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
        expiresIn: SIGNED_URL_TTL_SECONDS,
      });
    } catch (err) {
      this.logger.warn(`Echec generation URL signee (${key}): ${(err as Error).message}`);
      return null;
    }
  }

  /** Version tableau, pour signer plusieurs cles en parallele (galeries). */
  async getSignedUrls(keys: (string | null | undefined)[]): Promise<(string | null)[]> {
    return Promise.all(keys.map((k) => this.getSignedUrl(k)));
  }
}
