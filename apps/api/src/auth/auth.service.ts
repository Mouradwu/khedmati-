import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  /**
   * Inscription simple (section 3) : aucune vérification téléphonique
   * bloquante. Le champ `phoneVerification` reste UNVERIFIED et pourra être
   * mis à jour plus tard par le centre d'appels (section 4) sans changer ce
   * flux.
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException("Un compte existe déjà avec ce numéro de téléphone.");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: dto.role,
        preferredLanguage: dto.preferredLanguage ?? "FR",
        ...(dto.role === "CLIENT"
          ? {
              clientProfile: {
                create: { firstName: dto.firstName, lastName: dto.lastName },
              },
            }
          : {}),
        ...(dto.role === "PROFESSIONAL"
          ? {
              professionalProfile: {
                create: {
                  firstName: dto.firstName,
                  lastName: dto.lastName,
                  businessName: dto.businessName,
                },
              },
            }
          : {}),
      },
      include: { clientProfile: true, professionalProfile: true },
    });

    return this.buildAuthResponse(user.id, user.role, user.phone);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("Ce compte est suspendu ou désactivé.");
    }

    return this.buildAuthResponse(user.id, user.role, user.phone);
  }

  private buildAuthResponse(sub: string, role: string, phone: string) {
    const accessToken = this.jwt.sign({ sub, role });
    return {
      accessToken,
      user: { id: sub, role, phone },
    };
  }
}
