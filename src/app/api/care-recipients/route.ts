import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { careRecipientSchema } from "@/lib/validations/profile";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
  }

  const careRecipients = await prisma.careRecipient.findMany({
    where: { guardianId: guardianProfile.id },
    orderBy: { birthYear: "asc" },
  });

  return NextResponse.json({ careRecipients });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
  if (!guardianProfile) {
    return NextResponse.json({ error: "보호자 프로필이 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = careRecipientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, gender, birthYear, careLevel, diseases, mobilityLevel, specialNotes, profileImage, weight, height, medications, emergencyContact, address } = parsed.data;

  const careRecipient = await prisma.careRecipient.create({
    data: {
      guardianId: guardianProfile.id,
      name,
      gender,
      birthYear,
      careLevel,
      diseases: JSON.stringify(diseases),
      mobilityLevel,
      specialNotes,
      profileImage,
      weight,
      height,
      medications,
      emergencyContact,
      address,
    },
  });

  return NextResponse.json({ careRecipient }, { status: 201 });
}
