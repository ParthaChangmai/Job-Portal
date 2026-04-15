import { Prisma } from "@prisma/client";

export function isMissingTableError(error: unknown, tableName?: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2021") {
    return false;
  }

  const metaTable = typeof error.meta?.table === "string" ? error.meta.table : "";

  if (!tableName) {
    return true;
  }

  return metaTable.includes(tableName);
}
