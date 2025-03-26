import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPersonalFiles() {
  console.log('Starting personal files cleanup...');
  
  try {
    // Find all personal cases
    const personalCases = await prisma.case.findMany({
      where: {
        caseType: 'PERSONAL',
      },
      select: {
        id: true,
        _count: {
          select: {
            uploads: true
          }
        }
      }
    });
    
    console.log(`Found ${personalCases.length} personal cases to clean up`);
    
    // Process each personal case
    for (const personalCase of personalCases) {
      console.log(`Processing case ID: ${personalCase.id} with approximately ${personalCase._count.uploads} uploads`);
      
      // Use raw SQL to update the uploads directly
      await prisma.$executeRaw`UPDATE "Upload" SET "caseId" = NULL WHERE "caseId" = ${personalCase.id}`;
      
      console.log(`Updated uploads to have null caseId`);
      
      // Delete the personal case since we don't need it anymore
      await prisma.case.delete({
        where: {
          id: personalCase.id,
        },
      });
      
      console.log(`Deleted personal case ID: ${personalCase.id}`);
    }
    
    console.log('Personal files cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPersonalFiles()
  .then(() => console.log('Script completed'))
  .catch((error) => console.error('Script failed:', error)); 