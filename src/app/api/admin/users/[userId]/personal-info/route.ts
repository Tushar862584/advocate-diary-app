import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { personalInfo: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const data = await request.json();
    
    // Get necessary fields from request
    const {
      address,
      city,
      state,
      zipCode,
      phoneNumber,
      dateOfBirth,
      idNumber,
      notes,
    } = data;

    let personalInfo;

    if (user.personalInfo) {
      // Update existing personal info
      personalInfo = await prisma.personalInfo.update({
        where: { userId },
        data: {
          address,
          city,
          state,
          zipCode,
          phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          idNumber,
          notes,
        },
      });
    } else {
      // Create new personal info
      personalInfo = await prisma.personalInfo.create({
        data: {
          userId,
          address,
          city,
          state,
          zipCode,
          phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          idNumber,
          notes,
        },
      });
    }

    return NextResponse.json({ 
      message: "Personal information saved successfully",
      personalInfo 
    });
  } catch (error) {
    console.error("Error updating personal information:", error);
    return NextResponse.json(
      { error: "Failed to update personal information" },
      { status: 500 }
    );
  }
} 