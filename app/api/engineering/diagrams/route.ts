/**
 * Engineering Diagrams List API
 * GET /api/engineering/diagrams
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    // Get user's diagrams (will work after Prisma migration)
    const diagrams = await prisma.engineeringDiagram.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(diagrams);
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// This API uses authentication/session headers and therefore must be
// evaluated dynamically. Force Next.js to treat this route as dynamic
// so it won't be invoked during static page generation.
export const dynamic = "force-dynamic";
