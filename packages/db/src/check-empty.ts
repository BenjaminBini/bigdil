import { prisma } from './client.js'

try {
  const count = await prisma.client.count()
  await prisma.$disconnect()
  process.exit(count === 0 ? 0 : 1)
} catch {
  // Table doesn't exist yet — database is empty
  await prisma.$disconnect()
  process.exit(0)
}
