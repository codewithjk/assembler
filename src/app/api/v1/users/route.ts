import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await prisma.user.findMany()

  return NextResponse.json({ message: "Hello, Next.js API!" ,users});
}