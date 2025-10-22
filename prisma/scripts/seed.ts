import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'mariagraziacattaneo@yahoo.it'
  const password = 'pantere1234'
  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'MASTER' },
    create: { email, password: hashed, role: 'MASTER', name: 'Master' }
  })

  console.log('Seed OK: utente master creato/aggiornato')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
