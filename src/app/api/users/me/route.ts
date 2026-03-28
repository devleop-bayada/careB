import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      profileImage: true,
      createdAt: true,
      guardianProfile: {
        include: { careRecipients: true },
      },
      caregiverProfile: {
        include: { availabilities: true, certificates: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    name, phone, profileImage,
    region, address, introduction,
    relationship,
    gender, birthDate, experience, experienceYears, education,
    hourlyRate, additionalRate, serviceCategories, specialties,
    caregiverType, maxRecipients, licenseNumber,
    canDrive, nonsmoker,
  } = parsed.data;

  const userUpdate: Record<string, unknown> = {};
  if (name !== undefined) userUpdate.name = name;
  if (phone !== undefined) userUpdate.phone = phone;
  if (profileImage !== undefined) userUpdate.profileImage = profileImage;

  const profileUpdate: Record<string, unknown> = {};
  if (region !== undefined) profileUpdate.region = region;
  if (address !== undefined) profileUpdate.address = address;
  if (introduction !== undefined) profileUpdate.introduction = introduction;

  if (role === "GUARDIAN") {
    if (relationship !== undefined) profileUpdate.relationship = relationship;
  } else if (role === "CAREGIVER") {
    if (gender !== undefined) profileUpdate.gender = gender;
    if (birthDate !== undefined) profileUpdate.birthDate = new Date(birthDate);
    if (experience !== undefined) profileUpdate.experience = experience;
    if (experienceYears !== undefined) profileUpdate.experienceYears = experienceYears;
    if (education !== undefined) profileUpdate.education = education;
    if (hourlyRate !== undefined) profileUpdate.hourlyRate = hourlyRate;
    if (additionalRate !== undefined) profileUpdate.additionalRate = additionalRate;
    if (serviceCategories !== undefined) profileUpdate.serviceCategories = JSON.stringify(serviceCategories);
    if (specialties !== undefined) profileUpdate.specialties = JSON.stringify(specialties);
    if (caregiverType !== undefined) profileUpdate.caregiverType = caregiverType;
    if (maxRecipients !== undefined) profileUpdate.maxRecipients = maxRecipients;
    if (licenseNumber !== undefined) profileUpdate.licenseNumber = licenseNumber;
    if (canDrive !== undefined) profileUpdate.canDrive = canDrive;
    if (nonsmoker !== undefined) profileUpdate.nonsmoker = nonsmoker;
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id: userId }, data: userUpdate });
    }
    if (Object.keys(profileUpdate).length > 0) {
      if (role === "GUARDIAN") {
        await tx.guardianProfile.update({ where: { userId }, data: profileUpdate });
      } else if (role === "CAREGIVER") {
        await tx.caregiverProfile.update({ where: { userId }, data: profileUpdate });
      }
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, phone: true, role: true, profileImage: true,
      guardianProfile: { include: { careRecipients: true } },
      caregiverProfile: { include: { availabilities: true, certificates: true } },
    },
  });

  return NextResponse.json({ user });
}
