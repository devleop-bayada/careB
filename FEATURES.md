# 맘시터 (Momsitter) Complete Feature Specification

> Comprehensive feature list for cloning the MEMBER-FACING app (not admin).
> Research date: 2026-03-27

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [User Types](#user-types)
3. [Parent Features (부모 회원 기능)](#1-parent-features-부모-회원-기능)
4. [Sitter Features (시터 회원 기능)](#2-sitter-features-시터-회원-기능)
5. [Common Features (공통 기능)](#3-common-features-공통-기능)
6. [Navigation Structure](#4-navigation-structure)
7. [PROCARE / Pro Service](#5-procare--pro-service)
8. [Education Platform](#6-education-platform)
9. [Data & Statistics](#7-data--statistics)

---

## Service Overview

맘시터 is Korea's #1 childcare matching platform connecting parents with vetted sitters. The platform handles everything from sitter discovery to care management, payment settlement, and care logs in a single app.

**Core value proposition:**
- 90% of parents find a sitter within 2 hours
- 10,000+ active sitters available
- 890,000+ cumulative sitter members
- 4.2M+ cumulative chats
- 320,000+ parent reviews
- Average sitter satisfaction: 4.8/5.0

**Service categories (돌봄 유형):**
- 신생아/영아 전담 돌봄 (Newborn/Infant full-time care)
- 신생아/영아 보조 돌봄 (Newborn/Infant supplementary care)
- 등하원 돌봄 (School drop-off/pick-up)
- 놀이/학습 돌봄 (Play/Educational care)
- 긴급/단기 돌봄 (Emergency/Short-term care)
- 산후조리 (Postpartum care)
- 가사/청소 (Household/Cleaning)

**Target children age:** 0~10 years

---

## User Types

### Parent Members (부모회원)
- Parents seeking childcare services
- Must purchase 이용권 (subscription pass) to initiate contact

### Sitter Members (시터회원)
Four sitter types (시터유형) - chosen at registration:

| Type | Korean | Description |
|------|--------|-------------|
| Mom Sitter | 엄마시터 | Mothers with childcare experience |
| Teacher Sitter | 선생님시터 | Licensed daycare/kindergarten teachers |
| Student Sitter | 대학생시터 | University students |
| General Sitter | 일반시터 | Specialists with childcare skills (e.g., visiting infant teachers) |

---

## 1. Parent Features (부모 회원 기능)

### 1.1 시터 찾기 (Find a Sitter)

**Search & Filter System:**
- Location filter: 시/도 > 시/군/구 > 동/읍/면 (3-level location hierarchy)
- Schedule filter: 요일별 (by day of week), 시간대 (morning/noon/night)
- Hourly rate range filter (시급 범위)
- Care type filter (돌봄 유형 선택)
- Child age group filter (아이 나이대)
- Sitter type filter: 엄마시터 / 선생님시터 / 대학생시터 / 일반시터
- Sitter age range filter (20~60 years)
- Certification filter (인증 항목별 필터)
  - College certification
  - Newborn care certification
  - Elementary education certification
  - Young learner certification
  - Insurance coverage
- Pro sitter only filter (프로시터 전용)
- Payment card requirement filter

**Sort Options:**
- 인증 많은순 (Most certifications) - default
- 최근 업데이트순 (Most recently updated)

**Search Results:**
- Sitter card list with infinite scroll
- Result count display
- Scroll position memory
- Bookmark/favorite functionality
- Filter state persistence (saved with timestamp)

### 1.2 시터 프로필 보기 (View Sitter Profile)

**Profile information displayed:**
- Profile photo
- Sitter type badge (엄마/선생님/대학생/일반)
- Self-introduction (자기소개, max 350 characters)
- Age
- Activity regions (활동 가능 지역)
- Available schedule (활동 가능 시간)
- Desired hourly rate (희망 시급)
- Care types offered (가능한 돌봄 유형)
- Certification badges (인증 뱃지) - 10-step system
- Experience & skills description
- Parent reviews (부모 후기) with ratings
- Response rate
- Last login time

**10-Step Certification Badges (10단계 인증):**
1. 본인인증 (Identity verification) - required at signup
2. 등본/초본 (Resident registration)
3. 가족관계증명서 (Family relationship certificate)
4. 학적증명서 (Academic credentials)
5. 교사자격증 (Teaching certificate)
6. 건강확인증 (Health certificate)
7. 정부아이돌보미 (Government childcare provider credential)
8. 산후도우미 (Postpartum care specialist credential)
9. 범죄경력조회 (Criminal background check)
10. 맘시터 교육이수 (Momsitter education completion)

### 1.3 면접 제안 / 채용 (Interview Proposal & Hiring)

**Interview Proposal Flow:**
1. Parent views sitter profile
2. Parent clicks "면접 제안" (Propose Interview) - requires active 이용권
3. Parent selects proposed schedule/conditions
4. Sitter receives notification (push + KakaoTalk)
5. Sitter has 3 hours to respond (accept / negotiate / reject)
6. If accepted, chat room opens for detailed discussion

**Interview Process (3 stages):**
1. **전화 면접 (Phone Interview):** Basic screening - introduction, work conditions, experience, hourly rate expectations
2. **대면 면접 (In-Person Interview):** Under 1 hour, parents may offer transportation compensation (5,000~10,000 KRW)
3. **시범 돌봄 (Trial Care):** 1-2 hour session with the child, paid at agreed rate

**Hiring Confirmation (채용 확정):**
1. Parent sends 돌봄예약 신청 (care booking request) via chat
2. Sitter reviews and accepts the booking
3. Hiring is confirmed
4. Care schedule begins from the agreed start date

**Important notes:**
- 돌봄예약 기능 is APP-ONLY (not available on web)
- Web can view booking messages but cannot accept/cancel

### 1.4 이용권 구매 (Subscription Pass Purchase)

**Pass Types:** Period-based subscription passes (기간별 이용권)
- Multiple duration tiers (e.g., 7-day, 30-day, 90-day)
- Required to: propose interviews, accept sitter applications, initiate chat

**Purchase Benefits:**
- 10% cashback as 적립금 (store credit) on pass purchase amount
- Up to 30,000 KRW 돌봄비 지원 쿠폰 (care fee support coupon) immediately
- No additional matching fees (매칭 수수료 없음)

**Payment Methods:**
- Credit/debit card
- Spouse card accepted
- Corporate card accepted
- 쿠폰 (coupon) application supported
- 적립금 (store credit) application supported

**Tax Benefits:**
- Card payment included in credit card usage for year-end tax deduction (연말정산 소득공제)

### 1.5 돌봄 관리 (Care Management)

**Calendar View (캘린더):**
- Monthly/weekly calendar showing care schedule
- Sitter work log entries displayed on calendar
- Upcoming care sessions
- Past care session history

**Care Session Details:**
- Date & time
- Duration
- Activities performed
- Sitter notes
- Photos attached by sitter

### 1.6 돌봄일지 확인 (Care Log Review - Parent Side)

**Log contents (written by sitter, read by parent):**
- Date and time of care
- Activities performed (meals, play, naps, outings, etc.)
- Photos of the child during care
- File/document attachments
- Special notes or observations
- Child's mood/condition

### 1.7 정산/결제 (Payment Settlement)

**Settlement System:**
- Based on mutually agreed hourly rate (합의된 시급)
- Calculated from care log entries (일지 기반 정산)
- Calendar-based tracking
- Automatic calculation of hours worked
- Settlement request and confirmation flow
- Payment history view

### 1.8 후기 작성 (Write Reviews)

**Review System:**
- Star rating (별점)
- Text review
- Review incentives:
  - First review: 2,000 KRW store credit
  - Subsequent reviews: 1,000 KRW each
- Reviews visible on sitter's profile
- 320,000+ cumulative parent reviews

### 1.9 채팅 (Chat)

**Chat Features:**
- 1:1 chat with sitter after connection
- Text messaging
- Photo sharing
- File sharing
- 돌봄예약 신청 (care booking request) within chat
- 돌봄예약 확정 (booking confirmation) within chat
- Push notifications for new messages
- KakaoTalk notification integration
- Chat history preservation

### 1.10 알림 (Notifications)

**Notification Types:**
- New sitter application received
- Interview proposal response
- Chat messages
- Care booking status changes
- Care log submitted by sitter
- Settlement/payment notifications
- Promotion/coupon notifications
- Community activity notifications

### 1.11 부모 커뮤니티 (Parent Community)

**Community Features:**
- Community board (게시판)
- Post creation
- Comments
- Category-based browsing
- Parent-to-parent sharing of childcare experiences and tips

### 1.12 부모 프로필/글 작성 (Parent Profile / Job Posting)

**Parent job posting includes:**
- Child information (age, gender, number of children)
- Care type needed
- Desired schedule (days, times)
- Location (address/area)
- Desired hourly rate
- Special requirements or preferences
- Care start date

---

## 2. Sitter Features (시터 회원 기능)

### 2.1 일자리 찾기 (Find Jobs)

**Search & Filter System:**
- Location filter (활동 지역)
- Care type filter (돌봄 유형)
- Schedule filter (날짜/시간대)
- Child age filter
- Sort by most recent (최근 업데이트순 - default)
- Pro parent only filter (프로 부모 전용)
- Payment card requirement filter

**Job Listing Display:**
- Parent posting cards with key info
- Infinite scroll pagination
- Result count
- Scroll position memory

### 2.2 프로필 관리 (Profile Management)

**Profile Fields:**
- Profile photo (bright, friendly image recommended)
- Sitter type (엄마/선생님/대학생/일반)
- Self-introduction (자기소개, max 350 characters)
  - Experience with children
  - Interests and hobbies
  - Special skills
- Activity regions (활동 가능 지역) - multiple selectable
- Activity types: 실내놀이 (indoor play), 등하원 (school pickup), 야외활동 (outdoor activities), 학습 (learning), 가사 (housework)
- Available schedule (요일/시간대)
- Desired hourly rate (희망 시급)
- Care types available

### 2.3 인증 관리 (Certification Management)

**10-Step Certification System:**
Each certification verified by 맘시터 고객안전관리팀 (Customer Safety Management Team) reviewing official documents.

| Step | Certification | Document Required |
|------|--------------|-------------------|
| 1 | 본인인증 | Identity verification (required) |
| 2 | 등본/초본 | Resident registration transcript |
| 3 | 가족관계증명서 | Family relationship certificate |
| 4 | 학적증명서 | Academic transcript / enrollment verification |
| 5 | 교사자격증 | Teaching certificate (daycare/kindergarten) |
| 6 | 건강확인증 | Health clearance certificate |
| 7 | 정부아이돌보미 | Government childcare provider certification |
| 8 | 산후도우미 | Postpartum care specialist certification |
| 9 | 범죄경력조회 | Criminal background check |
| 10 | 맘시터 교육이수 | Momsitter platform education completion |

**Certification badges displayed on profile:**
- Each verified certification shows as a badge
- 핵심인증 뱃지 (Core certification badge) for verifying sitter type
- More certifications = higher search ranking

### 2.4 지원/면접/채용 관리 (Application & Hiring Management)

**Application Flow (시터 측):**
1. Browse parent job postings
2. Apply to desired postings (지원하기)
3. Wait for parent response
4. Receive interview proposal notification
5. Respond within 3 hours (accept/negotiate/reject)
6. Proceed to chat if accepted
7. Go through interview stages (phone > in-person > trial)
8. Receive 돌봄예약 신청 from parent
9. Review booking conditions
10. Accept to confirm hiring (채용 확정)

**For Pro Service:**
- 돌봄 예약 확정 기능 in chat
- Parent sends care conditions
- Sitter reviews and signs (서명)
- Automatic confirmation document generated (계약서 역할)

### 2.5 돌봄일지 작성 (Write Care Logs)

**Care Log Fields:**
- Date and time
- Activities performed (categorized)
  - Meals/feeding
  - Play activities
  - Nap/sleep
  - Outdoor activities
  - Learning activities
  - Hygiene/bathing
- Photo upload (camera access required)
- File/document upload
- Text notes and observations
- Child's mood/condition report

### 2.6 정산 확인 (Settlement Check)

**Settlement Features:**
- View care hours worked
- Hourly rate confirmation
- Total payment calculation
- Settlement history
- Payment status tracking

### 2.7 알림 (Notifications)

**Notification Types:**
- New interview proposals from parents
- Application status updates
- Chat messages
- Care booking requests
- Settlement/payment notifications
- Certification approval notifications
- Education course notifications
- Platform announcements

### 2.8 교육 (Education / Training)

**맘시터 교육 플랫폼 (edu.mom-sitter.com):**
- Online professional sitter education courses
- Government sitter training (정부 시터교육)
  - Basic course
  - Advanced course (심화 과정)
  - Age-specific courses (e.g., age 2+)
- Completion badge (교육이수 뱃지) for profile
- Pro sitter exclusive training videos (5 courses)
- Field know-how online lectures
- 150,000 KRW education coupon for Pro sitters

---

## 3. Common Features (공통 기능)

### 3.1 회원가입 (Registration)

**Parent Registration Flow:**
1. Select "시터님이 필요해요" (I need a sitter)
2. Phone number / identity verification (본인인증)
3. Basic information input
4. Child information input
5. Care needs setup
6. Location setup
7. Terms & conditions agreement
8. Registration complete

**Sitter Registration Flow:**
1. Select "일자리를 찾고있어요" (I'm looking for work)
2. Phone number / identity verification (본인인증)
3. Select sitter type (엄마/선생님/대학생/일반)
4. Verify sitter type with documentation
5. Basic profile setup
6. Activity region selection
7. Activity type selection
8. Available schedule setup
9. Desired hourly rate input
10. Profile photo upload
11. Self-introduction writing (350 chars)
12. Terms & conditions agreement
13. Registration complete

**Requirements:**
- Korean citizen, age 19+ (for sitters)
- Identity verification mandatory
- Age rating: 12+ (App Store)

### 3.2 로그인 (Login)

**Login Methods:**
- Email/phone + password
- Social login (카카오, 네이버, 애플 expected based on Korean market standards)
- Auto-login / session persistence
- Password reset

### 3.3 마이페이지 (My Page)

**Parent My Page:**
- Profile view/edit
- Child information management
- 이용권 status & purchase history
- 적립금 (store credit) balance
- 쿠폰 (coupon) list
- Care history
- Review management
- Bookmark/favorite sitters
- Payment card management
- Settlement history
- Notification settings
- App settings

**Sitter My Page:**
- Profile view/edit
- Certification management
- Education history
- Care history
- Care log history
- Settlement history
- Review received
- Notification settings
- App settings

### 3.4 채팅 (Chat - Common)

**Chat System:**
- Chat list (conversation list)
- 1:1 messaging
- Text, photo, file sharing
- Care booking within chat
- Read receipts
- Push notifications
- Chat search
- Block/report functionality

### 3.5 알림 센터 (Notification Center)

**Notification Center:**
- Chronological notification list
- Read/unread status
- Category-based filtering
- Push notification settings (on/off per category)
- KakaoTalk notification integration
- In-app notification badge

### 3.6 설정 (Settings)

**Settings Options:**
- Push notification settings (알림 설정)
  - Per-category toggle (chat, booking, settlement, promotion, etc.)
- Account management (계정 관리)
- Privacy settings
- App version info
- Terms of service (이용약관)
- Privacy policy (개인정보처리방침)
- Logout (로그아웃)
- Account deletion (회원탈퇴)

### 3.7 고객센터 (Customer Support)

**Support Features:**
- FAQ (자주 묻는 질문) - categorized
- 1:1 inquiry (1:1 문의)
- KakaoTalk channel support (카카오톡 채널)
- Phone support: 1833-6331
- Operating hours: Weekdays 10AM~6PM (lunch break 1PM~2PM, closed weekends)
- Help center categories:
  - 서비스 이용 방법 (How to use the service)
  - 응답 및 연락 (Responses & contact)
  - 결제 (Payment)
  - 채용 (Hiring)
  - 후기 (Reviews)
  - 회원정보 (Member information)
  - 맘시터Pro (Pro service)

### 3.8 안전 & 보험 (Safety & Insurance)

- 맘시터 안전보험 (Momsitter safety insurance)
- 돌봄보험 (Care insurance)
- Problematic sitters face permanent account suspension
- Customer Safety Management Team for certification verification

---

## 4. Navigation Structure

### 4.1 Bottom Tab Bar (하단 탭 바)

Based on analysis of the web/app structure, the bottom navigation consists of:

| Tab | Korean | Description |
|-----|--------|-------------|
| Home | 홈 | Main dashboard with recommendations, recent activity |
| Search | 맘시터찾기 / 일자리찾기 | Find sitters (parent) or Find jobs (sitter) |
| Community | 커뮤니티 | Parent community board |
| Chat | 채팅 | Conversation list |
| My Page | 마이페이지 | Profile, settings, history |

*Note: The tab bar content differs based on user type (parent vs sitter).*

### 4.2 Parent Bottom Tabs

| Tab | Screen |
|-----|--------|
| 홈 (Home) | Dashboard, recommended sitters, quick actions |
| 맘시터 찾기 (Find Sitter) | Sitter search with filters |
| 커뮤니티 (Community) | Parent community board |
| 채팅 (Chat) | Chat conversations list |
| MY | My page, profile, settings |

### 4.3 Sitter Bottom Tabs

| Tab | Screen |
|-----|--------|
| 홈 (Home) | Dashboard, recommended jobs, quick actions |
| 일자리 찾기 (Find Jobs) | Parent job posting search |
| 채팅 (Chat) | Chat conversations list |
| MY | My page, profile, certifications |

### 4.4 Top-Level Web Navigation

| Menu Item | Korean | URL Path |
|-----------|--------|----------|
| Home | 홈 | / |
| Find Sitter | 맘시터 찾기 | /search/sitter |
| Find Jobs | 일자리 찾기 | /search/parent |
| Community | 부모 커뮤니티 | /community |
| Purchase Pass | 이용권 구매 | /product |
| FAQ | 자주 묻는 질문 | /faq |
| Customer Support | 고객센터 | zendesk |
| Introduction | 서비스 소개 | /introduce |
| Login/Signup | 로그인/회원가입 | /login, /join |

### 4.5 Sub-Navigation / Screen Hierarchy

```
Parent App:
├── 홈 (Home)
│   ├── Recommended sitters
│   ├── Recent activity
│   ├── Quick search
│   └── Promotions/banners
├── 맘시터 찾기 (Find Sitter)
│   ├── Filter panel
│   │   ├── Location (3-level)
│   │   ├── Schedule (day/time)
│   │   ├── Care type
│   │   ├── Sitter type
│   │   ├── Sitter age
│   │   ├── Certifications
│   │   └── Rate range
│   ├── Search results (infinite scroll)
│   └── Sitter profile detail
│       ├── Basic info
│       ├── Certification badges
│       ├── Self-introduction
│       ├── Reviews
│       ├── "면접 제안" button
│       └── "북마크" button
├── 커뮤니티 (Community)
│   ├── Post list by category
│   ├── Post detail
│   ├── Write post
│   └── Comments
├── 채팅 (Chat)
│   ├── Conversation list
│   └── Chat room
│       ├── Messages
│       ├── Photo/file sharing
│       ├── 돌봄예약 신청
│       └── 돌봄예약 확정
├── MY (마이페이지)
│   ├── Profile
│   │   ├── View profile
│   │   ├── Edit profile
│   │   └── Child info management
│   ├── 이용권 (Subscription)
│   │   ├── Current pass status
│   │   ├── Purchase new pass
│   │   └── Purchase history
│   ├── 적립금 & 쿠폰
│   │   ├── Store credit balance
│   │   └── Coupon list
│   ├── 돌봄 관리 (Care Management)
│   │   ├── Calendar view
│   │   ├── Care session list
│   │   ├── Care log view
│   │   └── Settlement history
│   ├── 후기 관리 (Review Management)
│   │   ├── Written reviews
│   │   └── Write new review
│   ├── 북마크 (Bookmarks)
│   │   └── Bookmarked sitters list
│   ├── 결제 수단 (Payment Methods)
│   │   └── Card management
│   ├── 알림 설정 (Notification Settings)
│   ├── 고객센터 (Customer Support)
│   │   ├── FAQ
│   │   ├── 1:1 Inquiry
│   │   └── KakaoTalk channel
│   └── 설정 (Settings)
│       ├── Account management
│       ├── Terms of service
│       ├── Privacy policy
│       ├── App version
│       ├── Logout
│       └── Delete account

Sitter App:
├── 홈 (Home)
│   ├── Recommended jobs
│   ├── Recent activity
│   ├── Profile completion status
│   └── Certification progress
├── 일자리 찾기 (Find Jobs)
│   ├── Filter panel
│   │   ├── Location
│   │   ├── Schedule
│   │   ├── Care type
│   │   ├── Child age
│   │   └── Pro parent filter
│   ├── Job listing results (infinite scroll)
│   └── Parent posting detail
│       ├── Child info
│       ├── Care requirements
│       ├── Schedule
│       ├── Rate
│       └── "지원하기" button
├── 채팅 (Chat)
│   ├── Conversation list
│   └── Chat room
│       ├── Messages
│       ├── Photo/file sharing
│       ├── 돌봄예약 수락/거절
│       └── 돌봄일지 작성 link
├── MY (마이페이지)
│   ├── 프로필 (Profile)
│   │   ├── View profile
│   │   ├── Edit profile
│   │   ├── Photo management
│   │   └── Self-introduction
│   ├── 인증 관리 (Certifications)
│   │   ├── Certification status (10 steps)
│   │   ├── Submit new certification
│   │   └── Certification history
│   ├── 교육 (Education)
│   │   ├── Available courses
│   │   ├── Course progress
│   │   └── Completion certificates
│   ├── 돌봄 관리 (Care Management)
│   │   ├── Calendar view
│   │   ├── Active care sessions
│   │   ├── Care log writing
│   │   └── Past care history
│   ├── 정산 (Settlement)
│   │   ├── Current settlement
│   │   ├── Settlement history
│   │   └── Payment details
│   ├── 후기 확인 (Reviews Received)
│   │   └── Review list from parents
│   ├── 알림 설정 (Notification Settings)
│   ├── 고객센터 (Customer Support)
│   │   ├── FAQ
│   │   ├── 1:1 Inquiry
│   │   └── KakaoTalk channel
│   └── 설정 (Settings)
│       ├── Account management
│       ├── Sitter type change request
│       ├── Terms of service
│       ├── Privacy policy
│       ├── App version
│       ├── Logout
│       └── Delete account
```

---

## 5. PROCARE / Pro Service

### 맘시터 Pro (기관 전용 서비스)
A managed childcare service for employees of partner companies and government institutions.

**Key Differences from Regular Service:**
- Managed matching by dedicated account manager
- Stricter sitter vetting (documents + mandatory education + policy violation check)
- 100% safety insurance coverage
- Digital contract system (돌봄 예약 확정 with electronic signature)
- Fixed pricing structure

**Pricing (1 child):**
| Service Level | Hourly Rate |
|--------------|-------------|
| Base care | 14,950 KRW/hr |
| +1 add-on activity | 16,250 KRW/hr |
| +2 add-on activities | 17,550 KRW/hr |
| Late-night surcharge (11PM~7AM) | +1,950 KRW/hr |

- Weekends/holidays same as weekday rate
- 2-child rates scale proportionally

**Pro Sitter Benefits:**
- 150,000 KRW education coupon (for 3 professional courses)
- 5 exclusive Pro sitter training videos
- Field know-how online lectures
- Safety plan insurance (free)
- Operations manager consultation support

---

## 6. Education Platform

**URL:** edu.mom-sitter.com / momsitter-edu.com

**Course Categories:**
- 정부 시터교육 (Government sitter training)
  - Basic course
  - Advanced course (심화)
  - Age-specific courses (e.g., 2세 이상)
- 맘시터 전문 교육 (Momsitter professional education)
- Pro sitter exclusive education (5 video courses)
- Online special lectures (현장 노하우 특강)

**Education completion = certification badge on profile (교육이수 뱃지)**

---

## 7. Data & Statistics

Reference statistics for the platform (useful for realistic mock data):

| Metric | Value |
|--------|-------|
| Cumulative members | 1,370,000+ |
| Cumulative sitter members | 890,000+ |
| Cumulative matching transactions | 3,900,000+ |
| Cumulative chats | 4,200,000+ |
| Parent reviews | 320,000+ |
| Average sitter satisfaction | 4.8/5.0 |
| Active sitters | 10,000+ |
| Target child age | 0~10 years |
| Sitter monthly earnings range | 500,000~5,000,000 KRW |
| App Store aggregate rating | 3.5/5.0 (1,777 reviews) |

---

## 8. Complete Screen Inventory (for Clone)

### Authentication Screens
1. Splash / Loading screen
2. Onboarding slides
3. Login screen
4. Social login (Kakao, Naver, Apple)
5. Parent registration - step 1 (type selection)
6. Parent registration - step 2 (identity verification)
7. Parent registration - step 3 (basic info)
8. Parent registration - step 4 (child info)
9. Parent registration - step 5 (care needs)
10. Parent registration - step 6 (location)
11. Parent registration - step 7 (terms agreement)
12. Sitter registration - step 1 (type selection)
13. Sitter registration - step 2 (identity verification)
14. Sitter registration - step 3 (type verification)
15. Sitter registration - step 4 (profile setup)
16. Sitter registration - step 5 (activity settings)
17. Sitter registration - step 6 (terms agreement)
18. Password reset screen
19. Registration complete screen

### Parent Screens
20. Home (dashboard)
21. Find Sitter - search/filter
22. Find Sitter - results list
23. Sitter profile detail
24. Interview proposal form
25. Community - post list
26. Community - post detail
27. Community - write post
28. Chat - conversation list
29. Chat - chat room
30. Care booking request (in chat)
31. Care booking confirmation (in chat)
32. My Page - main
33. Profile view
34. Profile edit
35. Child info management
36. Subscription pass - current status
37. Subscription pass - purchase
38. Subscription pass - purchase history
39. Store credit & coupon list
40. Care management - calendar
41. Care management - session list
42. Care log view (from sitter)
43. Settlement history
44. Settlement detail
45. Review management
46. Write review
47. Bookmarked sitters
48. Payment card management
49. Add payment card

### Sitter Screens
50. Home (dashboard)
51. Find Jobs - search/filter
52. Find Jobs - results list
53. Parent posting detail
54. Job application form
55. Chat - conversation list
56. Chat - chat room
57. Care booking response (accept/reject in chat)
58. My Page - main
59. Profile view
60. Profile edit
61. Certification management - overview
62. Certification management - submit document
63. Certification detail
64. Education - course list
65. Education - course detail/player
66. Education - completion certificate
67. Care management - calendar
68. Care management - active sessions
69. Write care log
70. Care log history
71. Settlement - current
72. Settlement - history
73. Settlement - detail
74. Reviews received

### Common Screens
75. Notification center
76. Notification settings
77. Settings main
78. Account management
79. Terms of service
80. Privacy policy
81. FAQ list
82. FAQ detail
83. 1:1 inquiry form
84. 1:1 inquiry history
85. App info / version
86. Account deletion confirmation
87. Error / empty state screens
88. Network error screen
89. Permission request screens (camera, location, notifications)

### Total: ~89 unique screens

---

## 9. API Endpoints (Inferred)

Based on the feature analysis, the following API domains are needed:

### Auth
- POST /auth/signup (parent/sitter)
- POST /auth/login
- POST /auth/social-login
- POST /auth/verify-identity
- POST /auth/reset-password
- DELETE /auth/account

### Users / Profiles
- GET/PUT /users/me
- GET /users/:id/profile
- GET/PUT /parent/profile
- GET/PUT /parent/children
- GET/PUT /sitter/profile
- GET /sitter/:id/certifications
- POST /sitter/certifications
- GET /sitter/:id/reviews

### Search
- GET /search/sitters (with filters)
- GET /search/jobs (with filters)
- POST /bookmarks
- DELETE /bookmarks/:id

### Matching
- POST /interview-proposals
- PUT /interview-proposals/:id (accept/reject)
- POST /care-bookings
- PUT /care-bookings/:id (accept/reject/cancel)

### Care Management
- GET /care-sessions
- GET /care-sessions/:id
- POST /care-logs
- GET /care-logs
- GET /care-logs/:id

### Settlement
- GET /settlements
- GET /settlements/:id
- POST /settlements/request

### Subscription
- GET /products (이용권 list)
- POST /purchases
- GET /purchases/history
- GET /coupons
- GET /credits

### Chat
- GET /conversations
- GET /conversations/:id/messages
- POST /conversations/:id/messages
- WebSocket /chat

### Community
- GET /community/posts
- GET /community/posts/:id
- POST /community/posts
- POST /community/posts/:id/comments

### Notifications
- GET /notifications
- PUT /notifications/:id/read
- GET/PUT /notification-settings

### Reviews
- POST /reviews
- GET /reviews
- GET /reviews/:id

### Education
- GET /education/courses
- GET /education/courses/:id
- POST /education/courses/:id/enroll
- GET /education/progress

### Support
- GET /faq
- POST /inquiries
- GET /inquiries

---

## Sources

- [맘시터 App Store](https://apps.apple.com/kr/app/%EB%A7%98%EC%8B%9C%ED%84%B0/id1452104879)
- [맘시터 Google Play](https://play.google.com/store/apps/details?id=com.momsitter.android.hybridapp)
- [맘시터 공식 웹사이트](https://www.mom-sitter.com/)
- [맘시터 서비스 소개](https://www.mom-sitter.com/introduce)
- [맘시터 시터 랜딩](https://www.mom-sitter.com/land/sitter/)
- [맘시터 고객센터](https://mom-sitter.zendesk.com/hc/ko)
- [맘시터 이용권 구매 가이드](https://mom-sitter.zendesk.com/hc/ko/articles/900004383626)
- [맘시터 채용 확정 가이드](https://mom-sitter.zendesk.com/hc/ko/articles/900002367303)
- [맘시터 후기 작성 가이드](https://mom-sitter.zendesk.com/hc/ko/articles/900002389986)
- [맘시터 Pro 서비스](https://mom-sitter.zendesk.com/hc/ko/articles/22450726756761)
- [맘시터 Pro 사이트](https://momsitter-pro.com/)
- [맘시터 시터 알바 가이드](https://sunnymoneynews.com/%EB%A7%98%EC%8B%9C%ED%84%B0-%EC%95%8C%EB%B0%94/)
- [맘시터 교육 플랫폼](https://edu.mom-sitter.com)
- [맘편한세상 공식 홈페이지](https://www.mfort.co.kr/)
