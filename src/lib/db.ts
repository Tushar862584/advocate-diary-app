import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createPersonalFileUpload(data: {
  fileName: string;
  fileUrl: string;
  fileType: string;
  userId: string;
}) {
  try {
    console.log(`Creating personal file upload for user ${data.userId}`);
    
    // First, make sure the user has a PERSONAL case
    // Check if the user already has a PERSONAL case
    let personalCase = await prisma.case.findFirst({
      where: {
        userId: data.userId,
        caseType: "PERSONAL"
      }
    });
    
    // If no personal case exists, create one
    if (!personalCase) {
      console.log(`No personal case found for user ${data.userId}, creating one`);
      
      // Generate a unique registration number based on timestamp
      const currentYear = new Date().getFullYear();
      const uniqueNum = Math.floor(Date.now() / 1000) % 1000000; // Use timestamp for uniqueness
      
      personalCase = await prisma.case.create({
        data: {
          userId: data.userId,
          caseType: "PERSONAL",
          title: "Personal Files",
          courtName: "N/A", // Required field
          registrationYear: currentYear,
          registrationNum: uniqueNum,
          isCompleted: false
        }
      });
      console.log(`Created personal case with ID: ${personalCase.id}`);
    } else {
      console.log(`Found existing personal case with ID: ${personalCase.id}`);
    }
    
    // Now create the upload with the personal case ID
    console.log(`Creating upload record with caseId: ${personalCase.id}`);
    const upload = await prisma.upload.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        userId: data.userId,
        caseId: personalCase.id // Attach to the personal case
      }
    });
    
    console.log(`Personal file upload created with ID: ${upload.id}`);
    return upload;
  } catch (error) {
    console.error("Error creating personal file upload:", error);
    throw error;
  }
}

export async function getUsersWithInfo() {
  try {
    // Fetch all users with their basic info
    const users = await prisma.$queryRaw`
      SELECT u.id, u.name, u.email, u.role, 
            p.id as "personalInfoId", 
            p.address, p.city, p.state, p."zipCode", 
            p."phoneNumber", p."dateOfBirth", p."idNumber", p.notes
      FROM "User" u
      LEFT JOIN "PersonalInfo" p ON u.id = p."userId"
      ORDER BY u.name ASC
    `;
    
    // Process users to have the expected structure
    const processedUsers = Array.isArray(users) ? users.map(user => {
      // Extract personalInfo fields
      const personalInfo = user.personalInfoId ? {
        id: user.personalInfoId,
        address: user.address,
        city: user.city, 
        state: user.state,
        zipCode: user.zipCode,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        idNumber: user.idNumber,
        notes: user.notes
      } : null;
      
      // Remove personalInfo fields from user object
      const { 
        personalInfoId, address, city, state, zipCode, 
        phoneNumber, dateOfBirth, idNumber, notes, 
        ...userFields 
      } = user;
      
      return {
        ...userFields,
        personalInfo,
        uploads: [] // Will be filled in next step
      };
    }) : [];
    
    // Fetch and add uploads for each user
    for (const user of processedUsers) {
      try {
        // Use Prisma client instead of raw query to get case information
        const uploads = await prisma.upload.findMany({
          where: {
            userId: user.id
          },
          include: {
            case: {
              select: {
                id: true,
                caseType: true,
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        user.uploads = uploads;
        console.log(`Found ${uploads.length} uploads for user ${user.id}`);
        
        // Log personal files count for debugging
        const personalFiles = uploads.filter(upload => 
          upload.case?.caseType === "PERSONAL" || upload.caseId === null
        );
        console.log(`User ${user.id} has ${personalFiles.length} personal files`);
      } catch (error) {
        console.error(`Error fetching uploads for user ${user.id}:`, error);
        user.uploads = [];
      }
    }
    
    return processedUsers;
  } catch (error) {
    console.error("Error in getUsersWithInfo:", error);
    throw error;
  }
} 