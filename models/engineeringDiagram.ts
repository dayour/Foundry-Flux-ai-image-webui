import prisma from "@/lib/prisma";

export async function queryEngineeringDiagramById(id: string) {
  return prisma.engineeringDiagram.findUnique({ where: { id } });
}

export async function listEngineeringDiagramsForUser(userId: string, limit = 20) {
  return prisma.engineeringDiagram.findMany({ where: { userId }, take: limit, orderBy: { createdAt: 'desc' } });
}
