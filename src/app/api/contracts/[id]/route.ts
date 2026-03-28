import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      match: {
        include: {
          guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
          caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        },
      },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "계약서를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ contract });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as any).id as string;
  const role = (session!.user as any).role as string;

  const contract = await prisma.contract.findUnique({ where: { id: params.id } });
  if (!contract) {
    return NextResponse.json({ error: "계약서를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const { action, terminationReason } = body;

  if (!action) {
    return NextResponse.json({ error: "액션이 필요합니다." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (action === "guardian_sign") {
    if (role !== "GUARDIAN") {
      return NextResponse.json({ error: "보호자만 서명할 수 있습니다." }, { status: 403 });
    }
    data.guardianSigned = true;
    data.guardianSignedAt = new Date();

    // If caregiver already signed, activate the contract
    if (contract.caregiverSigned) {
      data.status = "ACTIVE";
    } else {
      data.status = "PENDING_SIGN";
    }
  } else if (action === "caregiver_sign") {
    if (role !== "CAREGIVER") {
      return NextResponse.json({ error: "요양보호사만 서명할 수 있습니다." }, { status: 403 });
    }
    data.caregiverSigned = true;
    data.caregiverSignedAt = new Date();

    // If guardian already signed, activate the contract
    if (contract.guardianSigned) {
      data.status = "ACTIVE";
    } else {
      data.status = "PENDING_SIGN";
    }
  } else if (action === "terminate") {
    data.status = "TERMINATED";
    data.terminatedAt = new Date();
    if (terminationReason) data.terminationReason = terminationReason;
  } else {
    return NextResponse.json({ error: "올바르지 않은 액션입니다." }, { status: 400 });
  }

  const updated = await prisma.contract.update({ where: { id: params.id }, data });
  return NextResponse.json({ contract: updated });
}
