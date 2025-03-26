import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check authentication status
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({
        authenticated: false,
        message: "Not authenticated",
        session: null
      }, { status: 200 });
    }

    // Debug info about the session
    const sessionInfo = {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      expires: session.expires
    };

    // Test user database access
    let users = [];
    let userDbError = null;
    try {
      // Get a few users
      users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
    } catch (error) {
      userDbError = error instanceof Error ? error.message : String(error);
    }

    // Return all debug information
    return NextResponse.json({
      authenticated: true,
      session: sessionInfo,
      timestamp: new Date().toISOString(),
      usersFound: users.length,
      users: users,
      userDbError
    });
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint error",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 