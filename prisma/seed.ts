import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CaseJson {
  case_type: string;
  filing: {
    number: string;
    date: string;
  };
  registration: {
    number: string;
    date: string;
  };
  cnr_number: string;
  case_status: {
    first_hearing_date: string;
    next_hearing_date: string;
    case_stage: string;
    court: {
      number: string;
      judge: string;
    };
  };
  petitioners: Array<{
    name: string;
    advocate?: string;
  }>;
  respondents: Array<{
    name: string;
    advocate?: string;
  }>;
  case_history: Array<{
    judge: string;
    business_on_date: string;
    hearing_date: string;
    purpose: string;
  }>;
  interim_orders: Array<{
    order_number: string;
    order_date: string;
    order_details: string;
  }>;
}

// Helper function to convert date from DD-MM-YYYY to ISO format
function convertDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const [day, month, year] = dateStr.split('-').map(Number);
  if (!day || !month || !year) return null;
  
  return new Date(year, month - 1, day);
}

// Extract registration number from format like "138/2024"
function extractRegistrationInfo(regNumStr: string): { num: number, year: number } | null {
  if (!regNumStr) return null;
  
  const parts = regNumStr.split('/');
  if (parts.length !== 2) return null;
  
  const num = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  
  if (isNaN(num) || isNaN(year)) return null;
  
  return { num, year };
}

async function main() {
  console.log('Starting seed process...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log(`Created admin user: ${admin.name} (${admin.id})`);
  
  // Two regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Test User 1',
      password: hashedPassword,
      role: 'USER',
    },
  });
  
  console.log(`Created user: ${user1.name} (${user1.id})`);
  
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Test User 2',
      password: hashedPassword,
      role: 'USER',
    },
  });
  
  console.log(`Created user: ${user2.name} (${user2.id})`);
  
  // Get all users for acquaintance assignment
  const allUsers = await prisma.user.findMany();
  
  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'db.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const cases: CaseJson[] = JSON.parse(jsonData);
  
  console.log(`Found ${cases.length} cases in db.json`);
  
  // Process each case
  for (let i = 0; i < cases.length; i++) {
    const caseData = cases[i];
    const regInfo = extractRegistrationInfo(caseData.registration.number);
    
    if (!regInfo) {
      console.log(`Skipping case with invalid registration number: ${caseData.registration.number}`);
      continue;
    }
    
    // Check if case already exists
    const existingCase = await prisma.case.findFirst({
      where: {
        caseType: caseData.case_type,
        registrationYear: regInfo.year,
        registrationNum: regInfo.num,
      },
    });
    
    if (existingCase) {
      console.log(`Case already exists: ${caseData.case_type} ${caseData.registration.number}`);
      continue;
    }
    
    console.log(`Creating case: ${caseData.case_type} ${caseData.registration.number}`);
    
    // Create the case
    const newCase = await prisma.case.create({
      data: {
        caseType: caseData.case_type,
        registrationYear: regInfo.year,
        registrationNum: regInfo.num,
        title: `${caseData.petitioners[0]?.name || 'Unknown'} vs ${caseData.respondents[0]?.name || 'Unknown'}`,
        courtName: `Court ${caseData.case_status.court.number} - ${caseData.case_status.court.judge}`,
        userId: allUsers[i % allUsers.length].id,
        
        // Create petitioners
        petitioners: {
          create: caseData.petitioners.map(p => ({
            name: p.name,
            advocate: p.advocate,
          })),
        },
        
        // Create respondents
        respondents: {
          create: caseData.respondents.map(r => ({
            name: r.name,
            advocate: r.advocate,
          })),
        },
        
        // Create hearings from case history
        hearings: {
          create: caseData.case_history.map(h => ({
            date: convertDate(h.business_on_date) || new Date(),
            nextDate: convertDate(h.hearing_date),
            nextPurpose: h.purpose,
            notes: `Hearing before ${h.judge}`,
          })),
        },
      },
    });
    
    console.log(`Created case with ID: ${newCase.id}`);
    
    // For every third case, create an acquaintance relationship
    if (i % 3 === 0 && allUsers.length > 1) {
      // Skip - no longer using acquaintances
    }
  }
  
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 