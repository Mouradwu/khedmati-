// Types TypeScript partagés côté frontend (web + mobile) qui ne dépendent
// pas directement de @khedmati/database (évite de faire dépendre le
// frontend du client Prisma). À enrichir au fur et à mesure des besoins
// d'API partagée (réponses paginées, formes de payload, etc.).
export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
};
