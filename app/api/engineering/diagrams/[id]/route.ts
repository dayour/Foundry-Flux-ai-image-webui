/**
 * Engineering Diagram Delete API
 * DELETE /api/engineering/diagrams/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const diagramId = params.id;

    // Check if diagram exists and belongs to user
    const diagram = await prisma.engineeringDiagram.findFirst({
      where: {
        id: diagramId,
        userId: user.id,
      },
    });

    if (!diagram) {
      return NextResponse.json(
        { error: "Diagram not found" },
        { status: 404 }
      );
    }

    // Delete diagram
    await prisma.engineeringDiagram.delete({
      where: { id: diagramId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diagram:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
