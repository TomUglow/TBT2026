import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'test@test.com' },
    data: { isAdmin: true },
  })
  console.log(`Updated ${result.count} user(s) to admin`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
