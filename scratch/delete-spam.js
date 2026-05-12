const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('[Sovereign Admin] Eliminando topics spam...');
  const t1 = await prisma.forumTopic.deleteMany({ where: { title: 'Hello' } });
  const t2 = await prisma.forumTopic.deleteMany({ where: { title: 'R' } });
  
  console.log(`[Sovereign Admin] Eliminado 'Hello': ${t1.count} topics.`);
  console.log(`[Sovereign Admin] Eliminado 'R': ${t2.count} topics.`);
  console.log('[Sovereign Admin] Limpieza completada.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
