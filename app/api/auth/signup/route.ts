import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "password length should be more than 6 characters",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // 查询用户是否存在
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    try {
      const user = await prisma.user.create({
        data: { email, name: username, password: hashedPassword },
      });
      const { password: _password, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
