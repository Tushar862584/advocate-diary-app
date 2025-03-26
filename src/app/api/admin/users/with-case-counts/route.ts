import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  // Verify user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Forbidden: Requires admin privileges' },
      { status: 403 }
    );
  }
  
  try {
    // Get all users with their case counts, excluding PERSONAL cases
    const users = await prisma.user.findMany({
      where: {
        role: { 
          in: ['ADMIN', 'USER'] 
        }
      },
      include: {
        cases: {
          where: {
            caseType: {
              not: 'PERSONAL'
            }
          },
          select: {
            id: true
          }
        },
        _count: {
          select: {
            cases: {
              where: {
                caseType: {
                  not: 'PERSONAL'
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Transform the data to include caseCount (excluding PERSONAL cases)
    const usersWithCounts = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      caseCount: user._count.cases
    }));
    
    return NextResponse.json({ users: usersWithCounts });
  } catch (error) {
    console.error('Error fetching users with case counts:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
} 