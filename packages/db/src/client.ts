import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://bigdil:bigdil@localhost:5433/bigdil'

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({ adapter })
