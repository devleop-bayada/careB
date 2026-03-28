import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const journals = await prisma.journal.findMany({
    where: { careSessionId: params.id },
    orderBy: { createdAt: "desc" },
  });

  const result = journals.map((j) => ({
    ...j,
    activities: JSON.parse(j.activities),
    images: JSON.parse(j.images),
  }));

  return NextResponse.json({ journals: result });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const {
    title, content, activities, mood, meals,
    bloodPressure, bloodSugar, waterIntake, bowelMovement,
    medicationTaken, exerciseLog, mentalState, sleepQuality,
    temperature, images,
  } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const journal = await prisma.journal.create({
    data: {
      careSessionId: params.id,
      title,
      content,
      activities: JSON.stringify(activities ?? []),
      mood,
      meals: meals ? JSON.stringify(meals) : null,
      bloodPressure: bloodPressure ?? null,
      bloodSugar: bloodSugar ?? null,
      waterIntake: waterIntake ?? null,
      bowelMovement: bowelMovement ?? null,
      medicationTaken: medicationTaken ?? null,
      exerciseLog: exerciseLog ?? null,
      mentalState: mentalState ?? null,
      sleepQuality: sleepQuality ?? null,
      temperature,
      images: JSON.stringify(images ?? []),
    },
  });

  return NextResponse.json({
    journal: {
      ...journal,
      activities: JSON.parse(journal.activities),
      images: JSON.parse(journal.images),
    },
  }, { status: 201 });
}
