-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'GUARDIAN',
    "profileImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "introduction" TEXT,
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoGuardian" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'READ',
    "inviteEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "region" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "introduction" TEXT,
    "experience" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "education" TEXT,
    "hourlyRate" INTEGER NOT NULL DEFAULT 15000,
    "additionalRate" INTEGER NOT NULL DEFAULT 0,
    "caregiverType" TEXT NOT NULL DEFAULT 'CARE_WORKER',
    "serviceCategories" TEXT NOT NULL DEFAULT '[]',
    "specialties" TEXT NOT NULL DEFAULT '[]',
    "maxRecipients" INTEGER NOT NULL DEFAULT 1,
    "canDrive" BOOLEAN NOT NULL DEFAULT false,
    "nonsmoker" BOOLEAN NOT NULL DEFAULT true,
    "licenseNumber" TEXT,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "backgroundCheck" TEXT NOT NULL DEFAULT 'PENDING',
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalCares" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'NEWBIE',
    "gradePoints" INTEGER NOT NULL DEFAULT 0,
    "videoIntroUrl" TEXT,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "certStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRecipient" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "careLevel" TEXT,
    "diseases" TEXT NOT NULL DEFAULT '[]',
    "mobilityLevel" TEXT NOT NULL DEFAULT 'INDEPENDENT',
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "specialNotes" TEXT,
    "medications" TEXT,
    "emergencyContact" TEXT,
    "address" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certType" TEXT NOT NULL DEFAULT 'OTHER',
    "step" INTEGER NOT NULL DEFAULT 0,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "certificateNumber" TEXT,
    "imageUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "serviceCategory" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "schedule" TEXT NOT NULL DEFAULT '[]',
    "specialRequests" TEXT,
    "estimatedRate" INTEGER,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchRecipient" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "careRecipientId" TEXT NOT NULL,

    CONSTRAINT "MatchRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL,
    "hourlyRate" INTEGER NOT NULL,
    "schedule" TEXT NOT NULL DEFAULT '[]',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "specialTerms" TEXT,
    "guardianSigned" BOOLEAN NOT NULL DEFAULT false,
    "guardianSignedAt" TIMESTAMP(3),
    "caregiverSigned" BOOLEAN NOT NULL DEFAULT false,
    "caregiverSignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewMessage" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "imageUrl" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareSession" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "hourlyRate" INTEGER NOT NULL,
    "totalHours" DOUBLE PRECISION,
    "totalAmount" INTEGER,
    "notes" TEXT,
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "checkInTime" TIMESTAMP(3),
    "checkOutLat" DOUBLE PRECISION,
    "checkOutLng" DOUBLE PRECISION,
    "checkOutTime" TIMESTAMP(3),
    "checkInAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareSessionRecipient" (
    "id" TEXT NOT NULL,
    "careSessionId" TEXT NOT NULL,
    "careRecipientId" TEXT NOT NULL,

    CONSTRAINT "CareSessionRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "careSessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "activities" TEXT NOT NULL DEFAULT '[]',
    "mood" TEXT,
    "meals" TEXT,
    "bloodPressure" TEXT,
    "bloodSugar" INTEGER,
    "temperature" DOUBLE PRECISION,
    "waterIntake" INTEGER,
    "bowelMovement" TEXT,
    "medicationTaken" BOOLEAN NOT NULL DEFAULT false,
    "exerciseLog" TEXT,
    "mentalState" TEXT,
    "sleepQuality" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "careSessionId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "disputedAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "careSessionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "punctuality" INTEGER,
    "attitude" INTEGER,
    "professionalism" INTEGER,
    "communication" INTEGER,
    "healthCareSkill" INTEGER,
    "content" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "reportReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencySOS" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careSessionId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencySOS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianProfile_userId_key" ON "GuardianProfile"("userId");

-- CreateIndex
CREATE INDEX "GuardianProfile_region_idx" ON "GuardianProfile"("region");

-- CreateIndex
CREATE INDEX "CoGuardian_ownerId_idx" ON "CoGuardian"("ownerId");

-- CreateIndex
CREATE INDEX "CoGuardian_memberId_idx" ON "CoGuardian"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "CoGuardian_ownerId_memberId_key" ON "CoGuardian"("ownerId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverProfile_userId_key" ON "CaregiverProfile"("userId");

-- CreateIndex
CREATE INDEX "CaregiverProfile_region_idx" ON "CaregiverProfile"("region");

-- CreateIndex
CREATE INDEX "CaregiverProfile_hourlyRate_idx" ON "CaregiverProfile"("hourlyRate");

-- CreateIndex
CREATE INDEX "CaregiverProfile_averageRating_idx" ON "CaregiverProfile"("averageRating");

-- CreateIndex
CREATE INDEX "CaregiverProfile_caregiverType_idx" ON "CaregiverProfile"("caregiverType");

-- CreateIndex
CREATE INDEX "CaregiverProfile_grade_idx" ON "CaregiverProfile"("grade");

-- CreateIndex
CREATE INDEX "CareRecipient_guardianId_idx" ON "CareRecipient"("guardianId");

-- CreateIndex
CREATE INDEX "Availability_caregiverId_idx" ON "Availability"("caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_caregiverId_dayOfWeek_startTime_key" ON "Availability"("caregiverId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "Certificate_caregiverId_idx" ON "Certificate"("caregiverId");

-- CreateIndex
CREATE INDEX "Certificate_certType_idx" ON "Certificate"("certType");

-- CreateIndex
CREATE INDEX "Match_guardianId_idx" ON "Match"("guardianId");

-- CreateIndex
CREATE INDEX "Match_caregiverId_idx" ON "Match"("caregiverId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchRecipient_matchId_careRecipientId_key" ON "MatchRecipient"("matchId", "careRecipientId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_matchId_key" ON "Contract"("matchId");

-- CreateIndex
CREATE INDEX "InterviewMessage_matchId_createdAt_idx" ON "InterviewMessage"("matchId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewMessage_senderId_idx" ON "InterviewMessage"("senderId");

-- CreateIndex
CREATE INDEX "CareSession_matchId_idx" ON "CareSession"("matchId");

-- CreateIndex
CREATE INDEX "CareSession_caregiverId_idx" ON "CareSession"("caregiverId");

-- CreateIndex
CREATE INDEX "CareSession_scheduledDate_idx" ON "CareSession"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "CareSessionRecipient_careSessionId_careRecipientId_key" ON "CareSessionRecipient"("careSessionId", "careRecipientId");

-- CreateIndex
CREATE INDEX "Journal_careSessionId_idx" ON "Journal"("careSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_careSessionId_key" ON "Settlement"("careSessionId");

-- CreateIndex
CREATE INDEX "Settlement_caregiverId_idx" ON "Settlement"("caregiverId");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_careSessionId_key" ON "Review"("careSessionId");

-- CreateIndex
CREATE INDEX "Review_targetId_idx" ON "Review"("targetId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_caregiverId_key" ON "Bookmark"("userId", "caregiverId");

-- CreateIndex
CREATE INDEX "CommunityPost_category_idx" ON "CommunityPost"("category");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityLike_postId_idx" ON "CommunityLike"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityLike_postId_userId_key" ON "CommunityLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "CommunityComment_postId_createdAt_idx" ON "CommunityComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EmergencySOS_userId_idx" ON "EmergencySOS"("userId");

-- CreateIndex
CREATE INDEX "EmergencySOS_status_idx" ON "EmergencySOS"("status");

-- AddForeignKey
ALTER TABLE "GuardianProfile" ADD CONSTRAINT "GuardianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoGuardian" ADD CONSTRAINT "CoGuardian_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "GuardianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoGuardian" ADD CONSTRAINT "CoGuardian_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GuardianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverProfile" ADD CONSTRAINT "CaregiverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRecipient" ADD CONSTRAINT "CareRecipient_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRecipient" ADD CONSTRAINT "MatchRecipient_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRecipient" ADD CONSTRAINT "MatchRecipient_careRecipientId_fkey" FOREIGN KEY ("careRecipientId") REFERENCES "CareRecipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMessage" ADD CONSTRAINT "InterviewMessage_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMessage" ADD CONSTRAINT "InterviewMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSession" ADD CONSTRAINT "CareSession_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSession" ADD CONSTRAINT "CareSession_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSessionRecipient" ADD CONSTRAINT "CareSessionRecipient_careSessionId_fkey" FOREIGN KEY ("careSessionId") REFERENCES "CareSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSessionRecipient" ADD CONSTRAINT "CareSessionRecipient_careRecipientId_fkey" FOREIGN KEY ("careRecipientId") REFERENCES "CareRecipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_careSessionId_fkey" FOREIGN KEY ("careSessionId") REFERENCES "CareSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_careSessionId_fkey" FOREIGN KEY ("careSessionId") REFERENCES "CareSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_careSessionId_fkey" FOREIGN KEY ("careSessionId") REFERENCES "CareSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "GuardianProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "CaregiverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityLike" ADD CONSTRAINT "CommunityLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

