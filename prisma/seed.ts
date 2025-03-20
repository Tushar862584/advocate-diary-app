import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.id);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('Regular user created:', user.id);

  // Read JSON data
  const jsonPath = path.join(process.cwd(), 'db.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  // Create cases from JSON data
  for (const caseData of jsonData) {
    const newCase = await prisma.case.create({
      data: {
        caseType: caseData.case_type,
        registrationYear: parseInt(caseData.registration.date.split('-')[2]), // Extract year from date
        registrationNum: parseInt(caseData.registration.number),
        title: `${caseData.petitioners[0].name} vs ${caseData.respondents[0].name}`,
        courtName: caseData.case_status.court.judge,
        userId: user.id,
        petitioners: {
          create: caseData.petitioners.map((p: any) => ({
            name: p.name,
          })),
        },
        respondents: {
          create: caseData.respondents.map((r: any) => ({
            name: r.name,
          })),
        },
        hearings: {
          create: caseData.case_history.map((h: any) => ({
            date: new Date(h.business_on_date.split('-').reverse().join('-')),
            notes: h.purpose,
            nextDate: h.hearing_date ? new Date(h.hearing_date.split('-').reverse().join('-')) : null,
            nextPurpose: h.purpose,
          })),
        },
        notes: {
          create: [
            {
              content: `Initial notes for case ${caseData.registration.number}`,
              userId: user.id,
            },
          ],
        },
      },
    });
    
    console.log(`Case created: ${newCase.caseType}/${newCase.registrationNum}`);
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 