import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to update a task" },
        { status: 401 }
      );
    }

    const { completed } = await request.json();
    if (completed === undefined) {
      return NextResponse.json(
        { error: "Completed status is required" },
        { status: 400 }
      );
    }

    const taskId = params.taskId;
    
    // First, get the task to check permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        case: true,
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to update this task
    const userId = session.user.id as string;
    const isAdmin = session.user.role === "ADMIN";
    const isCaseOwner = task.case.userId === userId;
    
    if (!isAdmin && !isCaseOwner) {
      return NextResponse.json(
        { error: "You don't have permission to update this task" },
        { status: 403 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a task" },
        { status: 401 }
      );
    }

    const taskId = params.taskId;
    
    // First, get the task to check permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        case: true,
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to delete this task
    const userId = session.user.id as string;
    const isAdmin = session.user.role === "ADMIN";
    const isCaseOwner = task.case.userId === userId;
    
    if (!isAdmin && !isCaseOwner) {
      return NextResponse.json(
        { error: "You don't have permission to delete this task" },
        { status: 403 }
      );
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the task" },
      { status: 500 }
    );
  }
} 