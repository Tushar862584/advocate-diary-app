import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    console.log(`Starting deletion for note ID: ${params.noteId}`);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = params.noteId;
    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Get the note first to check ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        case: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    console.log(`Note found: ${note.id}, caseId: ${note.caseId}, userId: ${note.userId}`);

    // Check if user owns this note directly (created it) or owns the case
    const userId = session.user.id as string;
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = note.userId === userId;
    const isCaseOwner = note.case && note.case.userId === userId;

    if (!isAdmin && !isOwner && !isCaseOwner) {
      return NextResponse.json(
        { error: "You don't have permission to delete this note" },
        { status: 403 }
      );
    }

    // Delete the note
    await prisma.note.delete({
      where: { id: noteId },
    });
    console.log(`Note deleted successfully: ${noteId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
