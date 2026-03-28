import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.emergencySOS.deleteMany();
  await prisma.coGuardian.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.matchRecipient.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.review.deleteMany();
  await prisma.careSessionRecipient.deleteMany();
  await prisma.careSession.deleteMany();
  await prisma.interviewMessage.deleteMany();
  await prisma.match.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.careRecipient.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.guardianProfile.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@bayada.co.kr",
      passwordHash: adminHash,
      name: "관리자",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("Created admin:", admin.email);

  // Guardian users
  const guardianHash = await bcrypt.hash("guardian123", 12);

  const guardian1 = await prisma.user.create({
    data: {
      email: "guardian1@example.com",
      passwordHash: guardianHash,
      name: "김영숙",
      phone: "010-1234-5678",
      role: "GUARDIAN",
      guardianProfile: {
        create: {
          region: "서울 강남구",
          address: "서울시 강남구 역삼동 123-45",
          introduction:
            "58세 주부로, 어머니의 일상 돌봄을 위한 믿음직한 요양보호사를 찾고 있습니다. 치매 증상이 있으셔서 전문 경험이 있으신 분을 원합니다.",
          relationship: "자녀",
        },
      },
    },
  });

  const guardian2 = await prisma.user.create({
    data: {
      email: "guardian2@example.com",
      passwordHash: guardianHash,
      name: "박정수",
      phone: "010-2345-6789",
      role: "GUARDIAN",
      guardianProfile: {
        create: {
          region: "서울 서초구",
          address: "서울시 서초구 서초동 456-78",
          introduction:
            "52세 직장인으로, 뇌졸중으로 거동이 불편하신 아버지의 전문적인 재활 돌봄 서비스를 찾고 있습니다. 평일 낮 시간 상주 가능한 분 우대합니다.",
          relationship: "자녀",
        },
      },
    },
  });

  const guardian3 = await prisma.user.create({
    data: {
      email: "guardian3@example.com",
      passwordHash: guardianHash,
      name: "이현주",
      phone: "010-3456-7890",
      role: "GUARDIAN",
      guardianProfile: {
        create: {
          region: "경기 성남시",
          address: "경기도 성남시 분당구 정자동 789-01",
          introduction:
            "45세 맞벌이 주부로, 파킨슨병과 고혈압을 앓고 계신 시어머니를 위해 경험 많은 방문요양 서비스를 구합니다. 약 복용 관리와 기본 물리치료 보조가 가능하신 분을 원합니다.",
          relationship: "배우자의 자녀",
        },
      },
    },
  });

  console.log("Created 3 guardian users");

  // Fetch guardian profiles
  const guardian1Profile = await prisma.guardianProfile.findUnique({
    where: { userId: guardian1.id },
  });
  const guardian2Profile = await prisma.guardianProfile.findUnique({
    where: { userId: guardian2.id },
  });
  const guardian3Profile = await prisma.guardianProfile.findUnique({
    where: { userId: guardian3.id },
  });

  // Care recipients
  const recipient1 = await prisma.careRecipient.create({
    data: {
      guardianId: guardian1Profile!.id,
      name: "김말순",
      gender: "FEMALE",
      birthYear: 1937,
      careLevel: "LEVEL_3",
      diseases: JSON.stringify(["치매", "관절질환"]),
      mobilityLevel: "PARTIALLY_DEPENDENT",
      weight: 65,
      height: 155,
      specialNotes:
        "치매 증상으로 가끔 배회 행동이 있습니다. 관절이 좋지 않아 보행 시 보조가 필요합니다.",
      medications: "아리셉트 5mg (아침), 관절염 약 (점심, 저녁)",
      emergencyContact: "김영숙 010-1234-5678",
      address: "서울시 강남구 역삼동 123-45",
    },
  });

  const recipient2 = await prisma.careRecipient.create({
    data: {
      guardianId: guardian2Profile!.id,
      name: "박기철",
      gender: "MALE",
      birthYear: 1945,
      careLevel: "LEVEL_4",
      diseases: JSON.stringify(["뇌졸중"]),
      mobilityLevel: "FULLY_DEPENDENT",
      weight: 72,
      height: 170,
      specialNotes:
        "뇌졸중 후 좌측 편마비가 있습니다. 식사 보조 및 체위 변경이 필요합니다. 재활 운동을 꾸준히 진행 중입니다.",
      medications: "혈압약 (아침), 항혈전제 (저녁), 재활 보조약품",
      emergencyContact: "박정수 010-2345-6789",
      address: "서울시 서초구 서초동 456-78",
    },
  });

  const recipient3 = await prisma.careRecipient.create({
    data: {
      guardianId: guardian3Profile!.id,
      name: "이옥분",
      gender: "FEMALE",
      birthYear: 1942,
      careLevel: "LEVEL_5",
      diseases: JSON.stringify(["파킨슨병", "고혈압"]),
      mobilityLevel: "PARTIALLY_DEPENDENT",
      weight: 55,
      height: 158,
      specialNotes:
        "파킨슨병으로 손 떨림이 심해 식사 및 세면 보조가 필요합니다. 고혈압으로 혈압 체크를 하루 2회 해주셔야 합니다.",
      medications: "파킨슨약 마도파 (하루 3회), 고혈압약 (아침)",
      emergencyContact: "이현주 010-3456-7890",
      address: "경기도 성남시 분당구 정자동 789-01",
    },
  });

  const recipient4 = await prisma.careRecipient.create({
    data: {
      guardianId: guardian1Profile!.id,
      name: "정순덕",
      gender: "FEMALE",
      birthYear: 1933,
      careLevel: "LEVEL_2",
      diseases: JSON.stringify(["치매", "당뇨"]),
      mobilityLevel: "BEDRIDDEN",
      weight: 48,
      height: 150,
      specialNotes:
        "91세 고령으로 대부분 와상 생활을 하십니다. 치매와 당뇨를 함께 앓고 계시며 욕창 예방을 위한 체위 변경이 매 2시간마다 필요합니다.",
      medications: "당뇨약 메트포르민 (식후), 치매약 (저녁), 인슐린 주사 (식전)",
      emergencyContact: "김영숙 010-1234-5678",
      address: "서울시 강남구 역삼동 123-45",
    },
  });

  console.log("Created 4 care recipients");

  // Caregiver users
  const caregiverHash = await bcrypt.hash("caregiver123", 12);

  const caregiver1 = await prisma.user.create({
    data: {
      email: "caregiver1@example.com",
      passwordHash: caregiverHash,
      name: "최순자",
      phone: "010-4567-8901",
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          gender: "FEMALE",
          birthDate: new Date("1969-03-15"),
          region: "서울 강남구",
          address: "서울시 강남구 청담동 11-22",
          introduction:
            "요양보호사 자격증을 보유하고 10년간 치매 어르신을 전문으로 돌봐온 베테랑 요양보호사입니다. 치매 어르신의 행동심리 증상을 이해하고 따뜻하고 인내심 있게 돌봄 서비스를 제공합니다. 가족처럼 정성껏 모시겠습니다.",
          experience: "요양원 치매 전문 케어 5년, 재가 방문요양 5년",
          experienceYears: 10,
          education: "요양보호사 자격 취득, 치매전문교육 이수",
          hourlyRate: 18000,
          caregiverType: "CARE_WORKER",
          serviceCategories: JSON.stringify([
            "HOME_CARE",
            "DEMENTIA_CARE",
            "DAY_NIGHT_CARE",
          ]),
          specialties: JSON.stringify(["치매전문", "인지재활", "행동심리증상 관리"]),
          maxRecipients: 1,
          nonsmoker: true,
          idVerified: true,
          licenseNumber: "요양-2013-0042817",
          licenseVerified: true,
          backgroundCheck: "VERIFIED",
          averageRating: 4.8,
          totalReviews: 0,
          totalCares: 47,
          responseRate: 98.5,
          availabilities: {
            create: [
              { dayOfWeek: "MON", startTime: "08:00", endTime: "18:00" },
              { dayOfWeek: "TUE", startTime: "08:00", endTime: "18:00" },
              { dayOfWeek: "WED", startTime: "08:00", endTime: "18:00" },
              { dayOfWeek: "THU", startTime: "08:00", endTime: "18:00" },
              { dayOfWeek: "FRI", startTime: "08:00", endTime: "18:00" },
            ],
          },
          certificates: {
            create: [
              {
                name: "요양보호사 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2013-04-10"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-01-10"),
              },
              {
                name: "치매전문교육 이수증",
                issuingOrganization: "중앙치매센터",
                issueDate: new Date("2020-09-15"),
                expirationDate: new Date("2026-09-15"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-01-10"),
              },
              {
                name: "응급처치 자격증",
                issuingOrganization: "대한적십자사",
                issueDate: new Date("2023-03-20"),
                expirationDate: new Date("2025-03-20"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-01-10"),
              },
            ],
          },
        },
      },
    },
  });

  const caregiver2 = await prisma.user.create({
    data: {
      email: "caregiver2@example.com",
      passwordHash: caregiverHash,
      name: "정미경",
      phone: "010-5678-9012",
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          gender: "FEMALE",
          birthDate: new Date("1976-07-22"),
          region: "서울 서초구",
          address: "서울시 서초구 방배동 33-44",
          introduction:
            "간호조무사 면허를 보유한 7년 경력의 전문 요양인입니다. 뇌졸중 및 중풍 어르신의 재활 돌봄에 특화되어 있으며, 기본 의료 처치와 재활 운동 보조가 가능합니다. 체계적이고 전문적인 돌봄 서비스를 제공합니다.",
          experience: "병원 간호 보조 3년, 재가 방문요양 및 재활 돌봄 4년",
          experienceYears: 7,
          education: "간호조무사 면허 취득, 재활요양 전문교육 이수",
          hourlyRate: 22000,
          caregiverType: "NURSING_AIDE",
          serviceCategories: JSON.stringify([
            "HOME_CARE",
            "HOME_NURSING",
            "HOSPITAL_CARE",
          ]),
          specialties: JSON.stringify(["뇌졸중재활", "편마비 케어", "욕창 예방 및 처치"]),
          maxRecipients: 1,
          nonsmoker: true,
          idVerified: true,
          licenseNumber: "간조-2017-0118934",
          licenseVerified: true,
          backgroundCheck: "VERIFIED",
          averageRating: 4.9,
          totalReviews: 0,
          totalCares: 35,
          responseRate: 97.0,
          availabilities: {
            create: [
              { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "TUE", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "WED", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "THU", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "FRI", startTime: "09:00", endTime: "18:00" },
            ],
          },
          certificates: {
            create: [
              {
                name: "간호조무사 면허",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2017-02-28"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-05"),
              },
              {
                name: "요양보호사 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2019-06-12"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-05"),
              },
              {
                name: "응급처치 자격증",
                issuingOrganization: "대한적십자사",
                issueDate: new Date("2022-11-08"),
                expirationDate: new Date("2024-11-08"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-05"),
              },
            ],
          },
        },
      },
    },
  });

  const caregiver3 = await prisma.user.create({
    data: {
      email: "caregiver3@example.com",
      passwordHash: caregiverHash,
      name: "한영희",
      phone: "010-6789-0123",
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          gender: "FEMALE",
          birthDate: new Date("1972-11-30"),
          region: "경기 성남시",
          address: "경기도 성남시 수정구 신흥동 55-66",
          introduction:
            "5년간 방문요양 서비스 전문으로 활동해온 요양보호사입니다. 어르신의 일상생활 지원, 가사 보조, 말벗 등 전반적인 재가 요양 서비스를 성실하게 제공합니다. 경기 성남 및 인근 지역 방문 가능합니다.",
          experience: "방문요양센터 소속 재가요양 전문 5년",
          experienceYears: 5,
          education: "요양보호사 자격 취득, 노인요양 전문교육 수료",
          hourlyRate: 16000,
          caregiverType: "CARE_WORKER",
          serviceCategories: JSON.stringify([
            "HOME_CARE",
            "HOURLY_CARE",
            "SHORT_TERM_CARE",
          ]),
          specialties: JSON.stringify(["방문요양전문", "일상생활 지원", "정서적 지지"]),
          maxRecipients: 2,
          nonsmoker: true,
          idVerified: true,
          licenseNumber: "요양-2019-0209561",
          licenseVerified: true,
          backgroundCheck: "VERIFIED",
          averageRating: 4.6,
          totalReviews: 0,
          totalCares: 29,
          responseRate: 95.0,
          availabilities: {
            create: [
              { dayOfWeek: "MON", startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: "WED", startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: "FRI", startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: "SAT", startTime: "09:00", endTime: "14:00" },
            ],
          },
          certificates: {
            create: [
              {
                name: "요양보호사 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2019-08-20"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-03-01"),
              },
            ],
          },
        },
      },
    },
  });

  const caregiver4 = await prisma.user.create({
    data: {
      email: "caregiver4@example.com",
      passwordHash: caregiverHash,
      name: "오정민",
      phone: "010-7890-1234",
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          gender: "MALE",
          birthDate: new Date("1982-05-18"),
          region: "서울 강남구",
          address: "서울시 강남구 논현동 77-88",
          introduction:
            "42세 남성 요양보호사로 남성 어르신 전문 돌봄 서비스를 제공합니다. 목욕 보조, 이동 지원 등 체력이 필요한 케어에 강점이 있으며, 어르신의 자존감을 배려한 남성 전담 서비스를 드립니다.",
          experience: "요양원 남성 어르신 전담 케어 3년",
          experienceYears: 3,
          education: "요양보호사 자격 취득, 노인 신체활동 지원 교육 수료",
          hourlyRate: 17000,
          caregiverType: "CARE_WORKER",
          serviceCategories: JSON.stringify([
            "HOME_CARE",
            "HOME_BATH",
            "HOURLY_CARE",
          ]),
          specialties: JSON.stringify(["남성어르신전문", "목욕 보조", "이동 및 체위 변경"]),
          maxRecipients: 1,
          canDrive: true,
          nonsmoker: true,
          idVerified: true,
          licenseNumber: "요양-2021-0314278",
          licenseVerified: true,
          backgroundCheck: "VERIFIED",
          averageRating: 4.5,
          totalReviews: 0,
          totalCares: 18,
          responseRate: 92.0,
          availabilities: {
            create: [
              { dayOfWeek: "TUE", startTime: "10:00", endTime: "19:00" },
              { dayOfWeek: "THU", startTime: "10:00", endTime: "19:00" },
              { dayOfWeek: "SAT", startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: "SUN", startTime: "09:00", endTime: "17:00" },
            ],
          },
          certificates: {
            create: [
              {
                name: "요양보호사 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2021-01-15"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-01-20"),
              },
              {
                name: "응급처치 자격증",
                issuingOrganization: "대한적십자사",
                issueDate: new Date("2022-05-10"),
                expirationDate: new Date("2024-05-10"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-01-20"),
              },
            ],
          },
        },
      },
    },
  });

  const caregiver5 = await prisma.user.create({
    data: {
      email: "caregiver5@example.com",
      passwordHash: caregiverHash,
      name: "윤은정",
      phone: "010-8901-2345",
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          gender: "FEMALE",
          birthDate: new Date("1974-09-05"),
          region: "서울 서초구",
          address: "서울시 서초구 잠원동 99-00",
          introduction:
            "사회복지사 자격증을 보유한 8년 경력의 호스피스 전문 케어 매니저입니다. 임종을 앞두신 어르신과 가족에게 신체적·정서적·영적 돌봄을 제공하며, 존엄한 마지막 시간을 함께합니다. 어르신과 가족 모두의 마음을 헤아리는 따뜻한 돌봄을 약속드립니다.",
          experience: "호스피스 전문 기관 사회복지사 5년, 재가 완화돌봄 3년",
          experienceYears: 8,
          education: "사회복지학과 졸업, 사회복지사 1급, 호스피스 전문교육 이수",
          hourlyRate: 20000,
          caregiverType: "SOCIAL_WORKER",
          serviceCategories: JSON.stringify([
            "HOSPICE_CARE",
            "HOME_CARE",
            "DAY_NIGHT_CARE",
          ]),
          specialties: JSON.stringify(["호스피스", "완화돌봄", "가족 상담 지원"]),
          maxRecipients: 1,
          nonsmoker: true,
          idVerified: true,
          licenseNumber: "사복-2016-0087432",
          licenseVerified: true,
          backgroundCheck: "VERIFIED",
          averageRating: 5.0,
          totalReviews: 0,
          totalCares: 22,
          responseRate: 99.0,
          availabilities: {
            create: [
              { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "TUE", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "WED", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "THU", startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: "FRI", startTime: "09:00", endTime: "18:00" },
            ],
          },
          certificates: {
            create: [
              {
                name: "사회복지사 1급 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2016-03-01"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-15"),
              },
              {
                name: "요양보호사 자격증",
                issuingOrganization: "보건복지부",
                issueDate: new Date("2018-07-20"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-15"),
              },
              {
                name: "치매전문교육 이수증",
                issuingOrganization: "중앙치매센터",
                issueDate: new Date("2021-11-10"),
                expirationDate: new Date("2027-11-10"),
                verificationStatus: "VERIFIED",
                verifiedAt: new Date("2024-02-15"),
              },
            ],
          },
        },
      },
    },
  });

  console.log("Created 5 caregiver users");

  // Fetch caregiver profiles
  const caregiver1Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver1.id },
  });
  const caregiver2Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver2.id },
  });

  // Sample matches (CONFIRMED)
  const match1 = await prisma.match.create({
    data: {
      guardianId: guardian1Profile!.id,
      caregiverId: caregiver1Profile!.id,
      status: "CONFIRMED",
      serviceCategory: "DEMENTIA_CARE",
      startDate: new Date("2024-09-01"),
      schedule: JSON.stringify([
        { dayOfWeek: "MON", startTime: "08:00", endTime: "18:00" },
        { dayOfWeek: "WED", startTime: "08:00", endTime: "18:00" },
        { dayOfWeek: "FRI", startTime: "08:00", endTime: "18:00" },
      ]),
      specialRequests:
        "치매 증상 관련 배회 방지 주의 부탁드립니다. 인지 자극 활동을 함께해 주시면 감사하겠습니다.",
      estimatedRate: 18000,
      respondedAt: new Date("2024-08-22"),
      confirmedAt: new Date("2024-08-23"),
    },
  });

  const match2 = await prisma.match.create({
    data: {
      guardianId: guardian2Profile!.id,
      caregiverId: caregiver2Profile!.id,
      status: "CONFIRMED",
      serviceCategory: "HOME_NURSING",
      startDate: new Date("2024-10-01"),
      schedule: JSON.stringify([
        { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "TUE", startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: "THU", startTime: "09:00", endTime: "18:00" },
      ]),
      specialRequests:
        "뇌졸중 재활 운동을 매일 30분씩 진행해 주세요. 혈압 측정도 오전·오후 1회씩 부탁드립니다.",
      estimatedRate: 22000,
      respondedAt: new Date("2024-09-25"),
      confirmedAt: new Date("2024-09-26"),
    },
  });

  console.log("Created 2 confirmed matches");

  // Care sessions
  const careSession1 = await prisma.careSession.create({
    data: {
      matchId: match1.id,
      caregiverId: caregiver1Profile!.id,
      status: "COMPLETED",
      scheduledDate: new Date("2024-09-02"),
      startTime: "08:00",
      endTime: "18:00",
      actualStart: new Date("2024-09-02T08:05:00"),
      actualEnd: new Date("2024-09-02T18:00:00"),
      hourlyRate: 18000,
      totalHours: 9.92,
      totalAmount: 178560,
      notes: "어르신 컨디션 양호. 오전 인지 자극 활동 진행, 점심 후 짧은 낮잠, 오후 산책.",
      recipients: {
        create: [{ careRecipientId: recipient1.id }],
      },
    },
  });

  const careSession2 = await prisma.careSession.create({
    data: {
      matchId: match2.id,
      caregiverId: caregiver2Profile!.id,
      status: "SCHEDULED",
      scheduledDate: new Date("2026-04-07"),
      startTime: "09:00",
      endTime: "18:00",
      hourlyRate: 22000,
      notes: "재활 운동 및 혈압 측정 예정.",
      recipients: {
        create: [{ careRecipientId: recipient2.id }],
      },
    },
  });

  console.log("Created 2 care sessions (1 COMPLETED, 1 SCHEDULED)");

  // Journals for completed session
  await prisma.journal.create({
    data: {
      careSessionId: careSession1.id,
      title: "오늘의 돌봄 일지 - 어르신 컨디션 양호",
      content:
        "오전에 그림 맞추기 퍼즐과 옛날 사진 보기 등 인지 자극 활동을 약 40분 진행했습니다. 점심은 죽과 반찬을 잘 드셨으며 식사량이 평소의 약 70% 정도였습니다. 오후에는 복도를 20분 가량 천천히 보행 훈련했습니다. 저녁 무렵 잠시 배회 기도가 있었으나 말벗을 통해 안정시켰습니다.",
      activities: JSON.stringify(["인지 자극 퍼즐", "사진 앨범 보기", "복도 보행 훈련", "말벗"]),
      mood: "CALM",
      meals: JSON.stringify({
        breakfast: "죽, 김치",
        lunch: "연두부찌개, 나물, 밥 반공기",
        snack: "바나나 반 개, 요구르트",
        dinner: "죽, 달걀찜",
      }),
      bloodPressure: "130/85",
      bloodSugar: 110,
      temperature: 36.5,
      waterIntake: 800,
      bowelMovement: "정상",
      medicationTaken: true,
      exerciseLog: "복도 보행 20분, 관절 스트레칭 10분",
      mentalState: "양호",
      sleepQuality: "양호",
      images: JSON.stringify([]),
    },
  });

  await prisma.journal.create({
    data: {
      careSessionId: careSession1.id,
      title: "오후 추가 기록 - 배회 증상 및 안정",
      content:
        "저녁 6시경 어르신이 '집에 가야한다'며 출입구 쪽으로 이동하려 하셨습니다. 보호자에게 즉시 연락하고, 좋아하시는 트로트 음악을 틀어드린 후 차분하게 대화하며 안정을 유도했습니다. 약 15분 후 안정을 되찾으셨습니다. 이후 특이사항 없이 케어 마무리했습니다.",
      activities: JSON.stringify(["트로트 음악 감상", "안정 유도 대화"]),
      mood: "ANXIOUS",
      meals: JSON.stringify({ snack: "따뜻한 보리차" }),
      bloodPressure: "138/90",
      bloodSugar: 118,
      temperature: 36.6,
      waterIntake: 200,
      bowelMovement: "없음",
      medicationTaken: false,
      mentalState: "불안",
      sleepQuality: "보통",
      images: JSON.stringify([]),
    },
  });

  console.log("Created 2 journals with health records");

  // Reviews
  const review1 = await prisma.review.create({
    data: {
      careSessionId: careSession1.id,
      authorId: guardian1Profile!.id,
      targetId: caregiver1Profile!.id,
      overallRating: 5,
      punctuality: 5,
      attitude: 5,
      professionalism: 5,
      communication: 5,
      healthCareSkill: 5,
      content:
        "최순자 선생님은 정말 훌륭하신 요양보호사십니다. 치매 어르신을 10년 넘게 돌봐오신 경험이 느껴질 정도로 어머니의 행동 증상을 능숙하게 다루어 주셨습니다. 배회 증상이 있을 때도 당황하지 않고 음악을 이용해 안정시켜 주신 것이 특히 인상 깊었습니다. 매일 꼼꼼한 돌봄 일지를 작성해 주셔서 멀리서도 어머니 상태를 파악할 수 있어 정말 안심이 됐습니다. 진심으로 감사드립니다.",
      images: JSON.stringify([]),
    },
  });

  // Update caregiver1 review stats
  await prisma.caregiverProfile.update({
    where: { id: caregiver1Profile!.id },
    data: {
      averageRating: 5.0,
      totalReviews: 1,
    },
  });

  console.log("Created 1 review with healthCareSkill rating");

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: caregiver1.id,
        type: "MATCH_REQUEST",
        title: "새로운 매칭 요청",
        body: "김영숙님이 치매 전문 돌봄 매칭을 요청했습니다.",
        link: `/matching/${match1.id}`,
        isRead: false,
      },
      {
        userId: guardian1.id,
        type: "MATCH_ACCEPTED",
        title: "매칭이 확정되었습니다",
        body: "최순자 요양보호사님이 매칭을 수락하였습니다.",
        link: `/matching/${match1.id}`,
        isRead: true,
        readAt: new Date("2024-08-23"),
      },
      {
        userId: guardian2.id,
        type: "MATCH_ACCEPTED",
        title: "매칭이 확정되었습니다",
        body: "정미경 간호조무사님이 매칭을 수락하였습니다.",
        link: `/matching/${match2.id}`,
        isRead: false,
      },
      {
        userId: caregiver1.id,
        type: "REVIEW_RECEIVED",
        title: "새 리뷰가 등록되었습니다",
        body: "김영숙님이 별점 5점 리뷰를 작성하셨습니다.",
        link: "/mypage/reviews",
        isRead: true,
        readAt: new Date("2024-09-03"),
      },
      {
        userId: caregiver2.id,
        type: "MATCH_REQUEST",
        title: "새로운 매칭 요청",
        body: "박정수님이 뇌졸중 재활 돌봄 매칭을 요청했습니다.",
        link: `/matching/${match2.id}`,
        isRead: true,
        readAt: new Date("2024-09-26"),
      },
    ],
  });

  console.log("Created sample notifications");

  // ─── Fetch caregiver3/4/5 profiles for later use ───
  const caregiver3Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver3.id },
  });
  const caregiver4Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver4.id },
  });
  const caregiver5Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver5.id },
  });

  // ─── MatchRecipient ───
  await prisma.matchRecipient.create({
    data: {
      matchId: match1.id,
      careRecipientId: recipient1.id,
    },
  });
  await prisma.matchRecipient.create({
    data: {
      matchId: match2.id,
      careRecipientId: recipient3.id,
    },
  });
  console.log("Created 2 match recipients");

  // ─── Contract ───
  const contract1 = await prisma.contract.create({
    data: {
      matchId: match1.id,
      serviceCategory: "DEMENTIA_CARE",
      hourlyRate: match1.estimatedRate ?? 18000,
      schedule: match1.schedule,
      startDate: match1.startDate,
      specialTerms: "치매 배회 방지 조치 및 인지 자극 활동 주 3회 이상 실시",
      guardianSigned: true,
      guardianSignedAt: new Date("2024-08-24"),
      caregiverSigned: true,
      caregiverSignedAt: new Date("2024-08-24"),
      status: "ACTIVE",
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      matchId: match2.id,
      serviceCategory: "HOME_NURSING",
      hourlyRate: match2.estimatedRate ?? 22000,
      schedule: match2.schedule,
      startDate: match2.startDate,
      specialTerms: "재활 운동 매일 30분, 혈압 오전·오후 각 1회 측정 기록",
      guardianSigned: true,
      guardianSignedAt: new Date("2024-09-27"),
      caregiverSigned: false,
      status: "PENDING_SIGN",
    },
  });
  console.log("Created 2 contracts (1 ACTIVE, 1 PENDING_SIGN)");

  // ─── Settlement ───
  const sessionAmount = careSession1.totalAmount ?? 178560;
  const platformFee = Math.round(sessionAmount * 0.03);
  const netAmount = sessionAmount - platformFee;
  await prisma.settlement.create({
    data: {
      careSessionId: careSession1.id,
      caregiverId: caregiver1Profile!.id,
      amount: sessionAmount,
      platformFee: platformFee,
      netAmount: netAmount,
      status: "CONFIRMED",
      confirmedAt: new Date("2024-09-03"),
    },
  });
  console.log("Created 1 settlement (CONFIRMED, platformFee 3%)");

  // ─── Bookmark ───
  await prisma.bookmark.create({
    data: { userId: guardian1.id, caregiverId: caregiver1Profile!.id },
  });
  await prisma.bookmark.create({
    data: { userId: guardian1.id, caregiverId: caregiver3Profile!.id },
  });
  await prisma.bookmark.create({
    data: { userId: guardian2.id, caregiverId: caregiver2Profile!.id },
  });
  console.log("Created 3 bookmarks");

  // ─── CommunityPost ───
  const post1 = await prisma.communityPost.create({
    data: {
      authorId: guardian1.id,
      category: "CARE_STORY",
      title: "치매 어르신 돌봄 경험담",
      content:
        "어머니가 치매 3등급 판정을 받으신 지 벌써 2년이 됐습니다. 처음엔 어떻게 해야 할지 몰라 막막했는데, 좋은 요양보호사 선생님을 만나면서 많이 안정됐어요. 배회 증상이 심할 때는 좋아하시는 트로트 음악을 틀어드리면 금세 안정되신다는 걸 배웠습니다. 인지 자극 활동도 꾸준히 하면 진행 속도를 늦출 수 있다고 하더라고요. 같은 상황에 계신 보호자분들과 경험을 나누고 싶어 글을 씁니다. 어떤 활동이 도움이 되셨나요? 저는 그림 퍼즐과 옛날 사진 보기가 효과적이었습니다.",
      viewCount: 142,
    },
  });

  const post2 = await prisma.communityPost.create({
    data: {
      authorId: guardian2.id,
      category: "CARE_INFO",
      title: "장기요양등급 신청 방법 총정리",
      content:
        "장기요양등급 신청이 복잡해 보여도 순서를 알면 어렵지 않습니다. 1단계: 국민건강보험공단 방문 또는 온라인 신청. 2단계: 공단 직원이 가정 방문하여 기능 상태 조사(약 90분 소요). 3단계: 등급 판정 위원회 심의(30일 이내). 4단계: 등급 결과 통보 및 급여 개시. 등급은 1~5등급과 인지지원등급으로 나뉩니다. 신청 시 의사 소견서가 필요하니 미리 준비하세요. 65세 이상이거나 노인성 질환(치매, 뇌졸중, 파킨슨 등)이 있으면 신청 가능합니다. 궁금한 점은 노인장기요양보험 콜센터 1577-1000으로 문의하세요.",
      viewCount: 287,
    },
  });

  const post3 = await prisma.communityPost.create({
    data: {
      authorId: caregiver1.id,
      category: "CAREGIVER_STORY",
      title: "요양보호사 3년차, 이 일을 계속하는 이유",
      content:
        "처음 이 일을 시작할 때 가족들의 반대가 심했습니다. 힘들고 급여도 많지 않다고요. 하지만 3년이 지난 지금, 저는 이 일이 천직이라고 느낍니다. 어르신이 처음 오셨을 때 무표정하고 말씀도 잘 안 하시던 분이 석 달 후에 웃으며 '선생님 왔어요?' 하고 먼저 부르실 때의 감동은 말로 표현할 수가 없어요. 치매 어르신의 행동심리 증상을 다루는 게 쉽지는 않지만, 그분의 입장에서 생각하면 이해가 됩니다. 요양보호사를 꿈꾸는 분들께 말씀드리고 싶어요. 이 일은 단순한 노동이 아니라 사람의 존엄을 지키는 일입니다.",
      viewCount: 98,
    },
  });

  const post4 = await prisma.communityPost.create({
    data: {
      authorId: admin.id,
      category: "POLICY",
      title: "2026년 장기요양보험 수가 인상 안내",
      content:
        "2026년 1월부터 장기요양 수가가 평균 3.2% 인상됩니다. 방문요양의 경우 시간당 수가가 기존 대비 인상되어 어르신 돌봄의 질 향상에 기여할 것으로 기대됩니다. 시설급여(요양원 등)는 1일당 수가가 조정되며, 재가급여는 방문요양, 방문목욕, 방문간호, 주야간보호 등 서비스별로 차등 인상됩니다. 자세한 수가 내역은 국민건강보험공단 홈페이지를 참고하시기 바랍니다.",
      viewCount: 412,
    },
  });

  const post5 = await prisma.communityPost.create({
    data: {
      authorId: caregiver2.id,
      category: "HEALTH",
      title: "고혈압 어르신을 위한 식단 관리법",
      content:
        "고혈압 어르신을 돌볼 때 식단 관리가 매우 중요합니다. 나트륨은 하루 2,000mg 이하로 제한하고, 국이나 찌개는 싱겁게 조리하세요. 칼륨이 풍부한 바나나, 감자, 시금치 등을 자주 드시면 혈압 조절에 도움이 됩니다. 포화지방이 많은 삼겹살, 버터는 피하고 등 푸른 생선(고등어, 삼치)을 주 2회 이상 섭취하도록 도와드리세요. 카페인이 든 커피나 진한 녹차도 제한이 필요합니다. 무엇보다 규칙적인 식사 시간을 지키는 것이 혈압 안정에 효과적입니다.",
      viewCount: 201,
    },
  });
  console.log("Created 5 community posts");

  // ─── CommunityLike ───
  const likeData = [
    // post1 likes (5 likes)
    { postId: post1.id, userId: guardian2.id },
    { postId: post1.id, userId: guardian3.id },
    { postId: post1.id, userId: caregiver1.id },
    { postId: post1.id, userId: caregiver2.id },
    { postId: post1.id, userId: caregiver3.id },
    // post2 likes (6 likes)
    { postId: post2.id, userId: guardian1.id },
    { postId: post2.id, userId: guardian3.id },
    { postId: post2.id, userId: caregiver1.id },
    { postId: post2.id, userId: caregiver2.id },
    { postId: post2.id, userId: caregiver4.id },
    { postId: post2.id, userId: caregiver5.id },
    // post3 likes (4 likes)
    { postId: post3.id, userId: guardian1.id },
    { postId: post3.id, userId: guardian2.id },
    { postId: post3.id, userId: caregiver3.id },
    { postId: post3.id, userId: caregiver5.id },
    // post4 likes (8 likes)
    { postId: post4.id, userId: guardian1.id },
    { postId: post4.id, userId: guardian2.id },
    { postId: post4.id, userId: guardian3.id },
    { postId: post4.id, userId: caregiver1.id },
    { postId: post4.id, userId: caregiver2.id },
    { postId: post4.id, userId: caregiver3.id },
    { postId: post4.id, userId: caregiver4.id },
    { postId: post4.id, userId: caregiver5.id },
    // post5 likes (3 likes)
    { postId: post5.id, userId: guardian1.id },
    { postId: post5.id, userId: guardian3.id },
    { postId: post5.id, userId: caregiver3.id },
  ];
  await prisma.communityLike.createMany({ data: likeData });
  console.log("Created 26 community likes");

  // ─── CommunityComment ───
  await prisma.communityComment.createMany({
    data: [
      // post1 comments
      {
        postId: post1.id,
        authorId: guardian3.id,
        content:
          "저도 비슷한 경험이 있어요. 음악 요법이 정말 효과적이더라고요. 특히 어르신이 젊었을 때 즐겨 듣던 노래가 효과가 좋았습니다.",
      },
      {
        postId: post1.id,
        authorId: caregiver2.id,
        content:
          "퍼즐이나 사진 보기 외에도 색칠하기, 옛날 물건 만지며 이야기 나누기도 인지 자극에 좋습니다. 힘내세요!",
      },
      {
        postId: post1.id,
        authorId: guardian2.id,
        content:
          "배회 증상이 심할 때 정말 힘드셨겠어요. 저도 아버지 돌보면서 많이 배우고 있습니다. 좋은 글 감사해요.",
      },
      // post2 comments
      {
        postId: post2.id,
        authorId: guardian1.id,
        content:
          "이렇게 정리된 자료가 없어서 힘들었는데 정말 도움이 됐습니다. 의사 소견서는 어느 병원에서나 발급받을 수 있나요?",
      },
      {
        postId: post2.id,
        authorId: caregiver1.id,
        content:
          "소견서는 노인의학 전문 병원이나 가정의학과에서 발급받으시면 됩니다. 일반 내과도 가능하지만 치매 관련 검사 기록이 있는 병원이 좋습니다.",
      },
      {
        postId: post2.id,
        authorId: guardian3.id,
        content:
          "저는 처음 신청할 때 5등급 나왔다가 재심사로 3등급 됐어요. 의사 소견서 내용이 중요하더라고요. 꼼꼼히 작성해달라고 부탁드리세요.",
      },
      // post3 comments
      {
        postId: post3.id,
        authorId: guardian1.id,
        content:
          "선생님 같은 분이 계셔서 저희 어머니가 행복하게 지내실 수 있는 것 같아요. 진심으로 감사드립니다.",
      },
      {
        postId: post3.id,
        authorId: caregiver3.id,
        content:
          "저도 요양보호사로 일한 지 5년 됐는데, 이 글 읽고 다시 한번 마음을 다잡게 됐어요. 함께 화이팅합시다!",
      },
      {
        postId: post3.id,
        authorId: caregiver5.id,
        content:
          "사람의 존엄을 지키는 일이라는 말씀, 깊이 공감합니다. 우리가 하는 일의 가치를 잊지 말아야겠어요.",
      },
      // post4 comments
      {
        postId: post4.id,
        authorId: guardian2.id,
        content:
          "수가 인상이 요양보호사 선생님들 처우 개선으로 이어지면 좋겠네요. 좋은 정보 감사합니다.",
      },
      {
        postId: post4.id,
        authorId: caregiver2.id,
        content:
          "인상 폭이 크지 않지만 그래도 조금씩 나아지고 있다는 게 반가운 소식이에요. 공유 감사합니다.",
      },
      // post5 comments
      {
        postId: post5.id,
        authorId: guardian3.id,
        content:
          "시어머니가 고혈압이신데 식단 신경을 많이 쓰고 있어요. 칼륨 음식 정보가 특히 도움됐습니다.",
      },
      {
        postId: post5.id,
        authorId: guardian1.id,
        content:
          "국 싱겁게 만드는 게 어르신들이 맛없다고 안 드시려 해서 고민이에요. 어떤 조리법이 좋을까요?",
      },
      {
        postId: post5.id,
        authorId: caregiver2.id,
        content:
          "싱거운 국에 들깨가루나 참기름을 조금 더하면 풍미가 살아나서 어르신들이 더 잘 드세요. 저는 그 방법 쓰고 있습니다.",
      },
    ],
  });
  console.log("Created 14 community comments");

  // ─── EmergencySOS ───
  await prisma.emergencySOS.create({
    data: {
      userId: guardian1.id,
      careSessionId: careSession1.id,
      latitude: 37.5005,
      longitude: 127.0369,
      status: "RESOLVED",
      resolvedAt: new Date("2024-09-02T18:30:00"),
      notes:
        "어르신 배회 증상 발생, 요양보호사가 안정시킴. 보호자 연락 후 특이사항 없이 종료.",
    },
  });
  console.log("Created 1 resolved EmergencySOS");

  // ─── CoGuardian ───
  await prisma.coGuardian.create({
    data: {
      ownerId: guardian1Profile!.id,
      memberId: guardian3Profile!.id,
      permission: "READ",
      inviteEmail: "guardian3@example.com",
      status: "ACCEPTED",
    },
  });
  console.log("Created 1 co-guardian (guardian1 -> guardian3, READ, ACCEPTED)");

  // ─── Update CaregiverProfile grades ───
  await prisma.caregiverProfile.update({
    where: { id: caregiver1Profile!.id },
    data: {
      grade: "EXPERT",
      gradePoints: 800,
      profileCompleteness: 90,
      certStep: 7,
    },
  });
  await prisma.caregiverProfile.update({
    where: { id: caregiver2Profile!.id },
    data: {
      grade: "SKILLED",
      gradePoints: 500,
      profileCompleteness: 85,
      certStep: 5,
    },
  });
  await prisma.caregiverProfile.update({
    where: { id: caregiver3Profile!.id },
    data: {
      grade: "GENERAL",
      gradePoints: 200,
      profileCompleteness: 75,
      certStep: 4,
    },
  });
  await prisma.caregiverProfile.update({
    where: { id: caregiver4Profile!.id },
    data: {
      grade: "NEWBIE",
      gradePoints: 50,
      profileCompleteness: 60,
      certStep: 2,
    },
  });
  await prisma.caregiverProfile.update({
    where: { id: caregiver5Profile!.id },
    data: {
      grade: "SKILLED",
      gradePoints: 500,
      profileCompleteness: 80,
      certStep: 6,
    },
  });
  console.log("Updated 5 caregiver grades and profile completeness");

  // ─── Update Certificate certType and step fields ───
  // caregiver1 certificates: 요양보호사 자격증 / 치매전문교육 / 응급처치
  const certs1 = await prisma.certificate.findMany({
    where: { caregiverId: caregiver1Profile!.id },
    orderBy: { issueDate: "asc" },
  });
  if (certs1[0])
    await prisma.certificate.update({
      where: { id: certs1[0].id },
      data: { certType: "CARE_WORKER_LICENSE", step: 1 },
    });
  if (certs1[1])
    await prisma.certificate.update({
      where: { id: certs1[1].id },
      data: { certType: "DEMENTIA_EDUCATION", step: 3 },
    });
  if (certs1[2])
    await prisma.certificate.update({
      where: { id: certs1[2].id },
      data: { certType: "FIRST_AID", step: 5 },
    });

  // caregiver2 certificates: 간호조무사 / 요양보호사 / 응급처치
  const certs2 = await prisma.certificate.findMany({
    where: { caregiverId: caregiver2Profile!.id },
    orderBy: { issueDate: "asc" },
  });
  if (certs2[0])
    await prisma.certificate.update({
      where: { id: certs2[0].id },
      data: { certType: "NURSING_AIDE_LICENSE", step: 1 },
    });
  if (certs2[1])
    await prisma.certificate.update({
      where: { id: certs2[1].id },
      data: { certType: "CARE_WORKER_LICENSE", step: 2 },
    });
  if (certs2[2])
    await prisma.certificate.update({
      where: { id: certs2[2].id },
      data: { certType: "FIRST_AID", step: 4 },
    });

  // caregiver3 certificates: 요양보호사
  const certs3 = await prisma.certificate.findMany({
    where: { caregiverId: caregiver3Profile!.id },
    orderBy: { issueDate: "asc" },
  });
  if (certs3[0])
    await prisma.certificate.update({
      where: { id: certs3[0].id },
      data: { certType: "CARE_WORKER_LICENSE", step: 1 },
    });

  // caregiver4 certificates: 요양보호사 / 응급처치
  const certs4 = await prisma.certificate.findMany({
    where: { caregiverId: caregiver4Profile!.id },
    orderBy: { issueDate: "asc" },
  });
  if (certs4[0])
    await prisma.certificate.update({
      where: { id: certs4[0].id },
      data: { certType: "CARE_WORKER_LICENSE", step: 1 },
    });
  if (certs4[1])
    await prisma.certificate.update({
      where: { id: certs4[1].id },
      data: { certType: "FIRST_AID", step: 2 },
    });

  // caregiver5 certificates: 사회복지사 / 요양보호사 / 치매전문교육
  const certs5 = await prisma.certificate.findMany({
    where: { caregiverId: caregiver5Profile!.id },
    orderBy: { issueDate: "asc" },
  });
  if (certs5[0])
    await prisma.certificate.update({
      where: { id: certs5[0].id },
      data: { certType: "SOCIAL_WORKER_LICENSE", step: 1 },
    });
  if (certs5[1])
    await prisma.certificate.update({
      where: { id: certs5[1].id },
      data: { certType: "CARE_WORKER_LICENSE", step: 2 },
    });
  if (certs5[2])
    await prisma.certificate.update({
      where: { id: certs5[2].id },
      data: { certType: "DEMENTIA_EDUCATION", step: 4 },
    });
  console.log("Updated certificate certType and step fields");

  console.log("\nSeed completed successfully!");
  console.log("\nLogin credentials:");
  console.log("  Admin:      admin@bayada.co.kr / admin123");
  console.log("  Guardian1:  guardian1@example.com / guardian123  (김영숙, 서울 강남구)");
  console.log("  Guardian2:  guardian2@example.com / guardian123  (박정수, 서울 서초구)");
  console.log("  Guardian3:  guardian3@example.com / guardian123  (이현주, 경기 성남시)");
  console.log("  Caregiver1: caregiver1@example.com / caregiver123  (최순자, 요양보호사/치매전문)");
  console.log("  Caregiver2: caregiver2@example.com / caregiver123  (정미경, 간호조무사/뇌졸중재활)");
  console.log("  Caregiver3: caregiver3@example.com / caregiver123  (한영희, 요양보호사/방문요양)");
  console.log("  Caregiver4: caregiver4@example.com / caregiver123  (오정민, 요양보호사/남성전문)");
  console.log("  Caregiver5: caregiver5@example.com / caregiver123  (윤은정, 사회복지사/호스피스)");
  console.log("\nNew seed data summary:");
  console.log("  MatchRecipient: 2 (match1->김말순, match2->이옥분)");
  console.log("  Contract: 2 (ACTIVE, PENDING_SIGN)");
  console.log("  Settlement: 1 (CONFIRMED, 3% platform fee)");
  console.log("  Bookmark: 3 (guardian1->cg1,cg3 / guardian2->cg2)");
  console.log("  CommunityPost: 5 (CARE_STORY, CARE_INFO, CAREGIVER_STORY, POLICY, HEALTH)");
  console.log("  CommunityLike: 26");
  console.log("  CommunityComment: 14");
  console.log("  EmergencySOS: 1 (RESOLVED)");
  console.log("  CoGuardian: 1 (guardian1->guardian3, READ, ACCEPTED)");
  console.log("  CaregiverProfile grades updated: 5");
  console.log("  Certificate certType/step updated: 9");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
