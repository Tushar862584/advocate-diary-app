import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user with proper bcrypt hash
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      password: hashedPassword
    },
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword, // Properly hashed password
      role: 'USER',
    },
  });

  console.log('Seeded user:', user);

  // Check if case already exists
  let caseData = await prisma.case.findFirst({
    where: {
      caseType: 'CIVIL',
      registrationYear: 2023,
      registrationNum: 12345,
    },
  });

  // If case doesn't exist, create it
  if (!caseData) {
    caseData = await prisma.case.create({
      data: {
        title: 'Test Case',
        caseType: 'CIVIL',
        courtName: 'Test Court',
        registrationNum: 12345,
        registrationYear: 2023,
        userId: user.id,
      },
    });
    console.log('Created new case:', caseData);
  } else {
    console.log('Using existing case:', caseData);
  }

  // Check if note already exists
  const existingNote = await prisma.note.findFirst({
    where: {
      caseId: caseData.id,
      userId: user.id,
      content: 'This is a test note',
    },
  });

  // Create a test note if it doesn't exist
  if (!existingNote) {
    const note = await prisma.note.create({
      data: {
        content: 'This is a test note',
        userId: user.id,
        caseId: caseData.id,
      },
    });
    console.log('Created new note:', note);
  } else {
    console.log('Note already exists:', existingNote);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 