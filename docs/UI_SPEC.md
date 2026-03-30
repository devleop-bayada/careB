# CareB 화면설계서 — 역할별 UI 명세

> 작성일: 2026-03-30
> 기준: 보호자(GUARDIAN) vs 요양보호사(CAREGIVER)

---

## 1. 전체 구조

### 1.1 바텀 네비게이션

| 순서 | 아이콘 | 보호자 레이블 | 요양보호사 레이블 | 이동 경로 |
|------|--------|--------------|----------------|-----------|
| 1 | Home | 홈 | 홈 | /home |
| 2 | Search | 요양보호사찾기 | 일자리찾기 | 보호자: /search/caregiver / 요양보호사: /search/guardian |
| 3 | Handshake | 매칭 | 면접제안 | /matching |
| 4 | MessageSquare | 채팅 | 채팅 | /chat |
| 5 | User | MY | MY | /my |

**표시 조건**: 아래 경로에서만 바텀 네비 및 상단 로고 헤더 표시

```
/home, /search, /search/caregiver, /search/guardian,
/community, /chat, /my, /care, /matching, /notifications
```

그 외 하위 상세 페이지(BackHeader 사용)에서는 바텀 네비 숨김.
단, `/notifications`는 바텀 네비 표시 / 상단 로고 헤더는 숨김.

**Floating SOS 버튼**: `/care/[id]` 경로(단, `/care/settlement` 제외)에서 화면 하단 우측에 표시. 클릭 시 확인 모달 후 `/api/emergency-sos` 호출.

---

### 1.2 페이지 접근 권한

| 경로 | 보호자 | 요양보호사 | 비로그인 |
|------|--------|-----------|---------|
| /home | O | O | 리다이렉트 /login |
| /search/caregiver | O | 바텀탭에서 /search/guardian으로 대체 | O (인증 불요) |
| /search/guardian | 바텀탭에서 /search/caregiver으로 대체 | O | O (인증 불요) |
| /caregiver/[id] | O | O | O (비로그인 시 CTA 미표시) |
| /guardian/[id] | O | O | O |
| /matching | O | O | 리다이렉트 /login |
| /matching/new | O (면접 제안하기) | O (지원하기) | 리다이렉트 /login |
| /matching/[id] | O (본인 매칭만) | O (본인 매칭만) | 리다이렉트 /login |
| /matching/[id]/contract | O | O | 리다이렉트 /login |
| /chat | O | O | 리다이렉트 /login |
| /chat/[id] | O | O | 리다이렉트 /login |
| /care | O | O | 리다이렉트 /login |
| /care/[id] | O | O | 리다이렉트 /login |
| /care/[id]/journal | X | O (CAREGIVER만) | 리다이렉트 /login |
| /care/settlement | O | O | 리다이렉트 /login |
| /community | O | O | O (로그인 없이 열람 가능) |
| /community/[id] | O | O | O |
| /community/write | O | O | 리다이렉트 /login |
| /notifications | O | O | 리다이렉트 /login |
| /emergency | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /emergency/waiting | O만 | X | 리다이렉트 /login |
| /education | X (GUARDIAN 접근 시 /home 리다이렉트) | O만 | 리다이렉트 /login |
| /education/[id] | X | O만 | 리다이렉트 /login |
| /portfolio | X (GUARDIAN 접근 시 /home 리다이렉트) | O만 | 리다이렉트 /login |
| /reviews/write | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /care-level-guide | O | O | O |
| /government-support | O | O | O |
| /my | O | O | 리다이렉트 /login |
| /my/profile | O | O | 리다이렉트 /login |
| /my/reviews | O (작성한 리뷰) | O (받은 리뷰) | 리다이렉트 /login |
| /my/bookmarks | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /my/pass | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /my/care-recipients | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /my/co-guardians | O만 (CAREGIVER 접근 시 /home 리다이렉트) | X | 리다이렉트 /login |
| /my/certificates | X (GUARDIAN 접근 시 /home 리다이렉트) | O만 | 리다이렉트 /login |
| /my/settings | O | O | 리다이렉트 /login |
| /terms, /privacy | O | O | O |

---

## 2. 페이지별 상세

### 2.1 홈 (/home)

#### 보호자 뷰 (GuardianHomePage)

| 섹션 | 구성 요소 |
|------|---------|
| 웰컴 배너 | 그라데이션 배경, 이름 + 인사 문구 |
| 퀵 액션 카드 | 4개: 요양보호사 찾기(/search/caregiver), 매칭 현황(/matching), 돌봄 관리(/care), 내 리뷰(/my/reviews) |
| 프로모션 배너 | "첫 요양 30% 할인" → /my/pass 링크 |
| 예정된 요양 (조건부) | DB에 SCHEDULED 세션 존재 시만 표시. 요양보호사 이름 + 날짜/시간 + Badge(요양 예정). → /care/[id] |
| 최근 등록 요양보호사 | 가로 스크롤 카드 목록. 아바타/이름/지역/평점. → /caregiver/[id] |
| AI 추천 요양보호사 | 최근 요양보호사 3명 + 매칭률(95/91/87%) 원형 진행바. → /caregiver/[id] |
| 요양 서비스 종류 | 9가지 서비스 카테고리 3x3 그리드. → /search/caregiver?serviceCategory=XXX |
| 이런 분들에게 추천 | 3개 상황별 추천 카드 (긴급 간병, 재가요양, 치매) |
| CareB 특별한 이유 | 4개 신뢰 카드: 7단계 인증, 실시간 돌봄일지, GPS 출퇴근, 안심 정산 |

#### 요양보호사 뷰 (CaregiverHomePage)

| 섹션 | 구성 요소 |
|------|---------|
| 웰컴 배너 | 그라데이션 배경, "OOO 요양보호사님" 인사 |
| 퀵 액션 카드 | 4개: 일자리 찾기(/search/guardian), 지원 현황(/matching), 돌봄 관리(/care), 자격 관리(/my/certificates) |
| 받은 면접 제안 | 가장 상단 강조. 건수 빨간 뱃지. 보호자 아바타/이름/서비스유형/시급/날짜 + Badge(대기중). 없으면 빈 상태 안내. → /matching?tab=PENDING |
| 진행 중인 돌봄 (조건부) | ACCEPTED/CONFIRMED/IN_PROGRESS 매칭 존재 시만. → /matching?tab=ACTIVE |
| 예정된 요양 (조건부) | SCHEDULED 세션 존재 시만. 보호자 이름 + 날짜/시간. → /care/[id] |
| 이번 달 수입 요약 | 2개 카드: 총 수입(원), 돌봄 시간(시간) |
| 프로필 완성도 (조건부) | profileCompleteness < 100 시만. 진행바 + % + /my 링크 |

#### 차이점 요약

| 항목 | 보호자 | 요양보호사 |
|------|--------|----------|
| 퀵 액션 | 요양보호사 찾기, 매칭 현황, 돌봄 관리, 내 리뷰 | 일자리 찾기, 지원 현황, 돌봄 관리, 자격 관리 |
| 주요 콘텐츠 | 프로모션, 요양보호사 목록, AI 추천, 서비스 카테고리 | 받은 면접 제안(우선), 진행 중 돌봄, 수입 요약 |
| 부재 상태 | 항상 서비스 카테고리 표시 | 프로필 완성도 진행바 표시 |

---

### 2.2 검색

#### 요양보호사 찾기 (/search/caregiver) — 보호자 접근

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | "요양보호사 찾기" + 고정 필터바 (sticky top-14) |
| 필터 | CaregiverSearchFilters: 지역(region), 서비스유형(careType), 정렬(sort: averageRating/updatedAt) |
| 결과 카운트 | "N명의 요양보호사를 찾았어요" |
| 목록 | 아바타/이름/지역/별점/자격증 수/서비스 태그/시급. 빈 상태 시 EmptyState. → /caregiver/[id] |

#### 일자리 찾기 (/search/guardian) — 요양보호사 접근

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | "일자리 찾기" + 고정 필터바 |
| 필터 | GuardianSearchFilters: 지역(region) |
| 결과 카운트 | "N건의 구인글이 있어요" |
| 목록 | 아바타/이름/지역/어르신 수/자기소개. → /guardian/[id] |

---

### 2.3 프로필 상세

#### 요양보호사 프로필 (/caregiver/[id])

| 구성 요소 | 내용 |
|---------|------|
| 상단 헤더 | BackHeader "요양보호사 프로필", fallback: /search/caregiver |
| 프로필 카드 | 아바타(xl), 이름, GradeBadge, 지역, 별점/리뷰수/경력년수 |
| 인증 자격증 | VERIFIED 상태 자격증만 Badge(success) 표시 |
| 서비스 태그 | serviceCategories JSON 파싱 → Tag 컴포넌트 |
| 등급 진행바 | GradeBadge + 등급 포인트 기반 진행바 |
| 희망 시급 카드 | primary-50 배경, 시급(원/시간) |
| 탭 영역 | CaregiverTabs (소개/자격/이용가능시간/리뷰) |
| 하단 CTA 고정 | 메시지 버튼 + 면접 제안하기(/matching/new?caregiverId=) — 보호자 접근 시 / 요양보호사 접근 시 "지원하기" 버튼 표시 |
| 북마크 | BookmarkButton — 보호자 접근 시만 표시 |

#### 보호자 프로필 (/guardian/[id])

| 구성 요소 | 내용 |
|---------|------|
| 상단 헤더 | BackHeader "보호자 프로필", fallback: /search/guardian |
| 프로필 카드 | 아바타, 이름, 지역 |
| 어르신 정보 | careRecipients 목록: 이름/나이/성별 |
| 소개 | introduction 텍스트 (있을 때만) |
| 하단 CTA 고정 | 메시지 버튼 + 지원하기(/matching/new?guardianId=) — 요양보호사 접근 시만 표시 |

---

### 2.4 매칭

#### 매칭 목록 (/matching)

| 구성 요소 | 내용 |
|---------|------|
| 페이지 제목 | 보호자: "매칭 현황" / 요양보호사: "받은 면접 제안" |
| 탭 필터 | MatchingTabs: ALL / PENDING / ACTIVE / DONE |
| 카드 목록 | 상대방 아바타/이름/서비스유형/날짜 + 상태 Badge. 빈 상태 시 EmptyState + 역할별 검색 바로가기 버튼 |
| 상태 Badge | PENDING(대기중/노란), ACCEPTED(수락됨/파란), REJECTED(거절됨/빨간), CONFIRMED(확정됨/초록), IN_PROGRESS(진행중/primary), COMPLETED(완료/회색), CANCELLED(취소됨/회색) |

#### 매칭 상세 (/matching/[id])

| 구성 요소 | 내용 |
|---------|------|
| 상태 헤더 | 매칭 상태 Badge + 상태 설명 문구 |
| 상대방 카드 | 아바타/이름/서비스유형 + 채팅 버튼(/chat/[matchId]) |
| 진행 현황 타임라인 | PENDING → ACCEPTED → CONFIRMED → IN_PROGRESS → COMPLETED 5단계 세로 타임라인 |
| 매칭 정보 | 서비스유형/요청일/시작일/특별요청사항 |
| 연결된 어르신 (조건부) | careRecipients 있을 때만 |
| 계약서 버튼 (조건부) | 상태가 CONFIRMED/IN_PROGRESS/COMPLETED일 때만 → /matching/[id]/contract |
| 하단 액션 | MatchingActions 컴포넌트 (역할/상태에 따른 수락/거절/확정 버튼) |

#### 면접 제안 / 지원 폼 (/matching/new)

쿼리 파라미터에 따른 두 가지 플로우:
- `?caregiverId=`: 보호자가 요양보호사에게 면접 제안 (타이틀: "면접 제안하기")
- `?guardianId=`: 요양보호사가 보호자에게 지원 (타이틀: "돌봄 지원하기")

| 폼 필드 | 내용 |
|---------|------|
| 상대방 정보 카드 | 아바타/이름/지역/경력/시급 (조회 중 스켈레톤 표시) |
| 돌봄 대상자 선택 | 보호자의 careRecipients 목록 다중 선택. 없으면 "어르신 등록하기" 링크(/my/care-recipients) |
| 돌봄 유형 | Select (9가지 서비스 카테고리) |
| 돌봄 요일 | 월~일 요일 토글 버튼 |
| 시작/종료 시간 | TimePicker 2개 |
| 시작일/종료일 | DatePicker 2개 (종료일 선택 사항) |
| 희망 시급 | 숫자 입력 |
| 요청 메시지 | Textarea (500자 제한) |
| 하단 고정 버튼 | "면접 제안 보내기" / "지원하기" |

#### 계약서 (/matching/[id]/contract)

| 구성 요소 | 내용 |
|---------|------|
| 상태 배너 | 양측 서명 완료 시 녹색 "계약 체결 완료" / 미완료 시 "계약서 서명 대기" |
| 계약 정보 | 서비스유형/보호자/요양보호사/시작일/특별요청사항 |
| 서명 현황 | 보호자/요양보호사 각각 서명 완료/대기 상태 표시 |
| 하단 서명 버튼 | 보호자이면 보호자 서명 버튼 / 요양보호사이면 요양보호사 서명 버튼 (양측 완료 시 숨김) |

---

### 2.5 채팅

#### 채팅 목록 (/chat)

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | "채팅" 타이틀 |
| 실시간 | Supabase Realtime 구독 (InterviewMessage INSERT) |
| 채팅방 목록 | 상대방 아바타/이름/마지막메시지/날짜/안읽음 카운트 Badge. 빈 상태 시 EmptyState + 역할별 검색 바로가기 |
| 정렬 | 최신 메시지 순 (최상단 이동) |

#### 채팅방 (/chat/[id])

- 매칭 ID 기반 채팅방
- Supabase Realtime 실시간 메시지 수신
- 메시지 입력/전송

---

### 2.6 돌봄 관리

#### 돌봄 목록 (/care)

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | "돌봄 관리" + CareTabs (고정) |
| 탭 | SCHEDULED(예정) / IN_PROGRESS(진행중) / COMPLETED(완료) / ALL |
| 카드 목록 | 상대방 아바타/이름/날짜시간 + 상태 Badge. 요양보호사는 COMPLETED 세션에 "일지 작성됨/미작성" 추가 Badge 표시 |

#### 돌봄 상세 (/care/[id])

| 구성 요소 | 내용 |
|---------|------|
| 상단 | 날짜 + 상태 Badge |
| 상대방 카드 | 아바타/이름 + 메시지 버튼(/chat/[matchId]) |
| 돌봄 일정 | 날짜/시간/총 시간·금액 |
| 돌봄 어르신 (조건부) | recipients 있을 때만 |
| GPS 체크인/아웃 (조건부) | SCHEDULED/IN_PROGRESS 상태일 때만. CareCheckInOut 컴포넌트 |
| 돌봄 일지 | 일지 목록. 요양보호사이고 COMPLETED 상태면 "일지 작성" 버튼 → /care/[id]/journal |
| 리뷰 작성 버튼 (조건부) | 보호자이고 COMPLETED 상태일 때만. 이미 작성 시 "리뷰 작성 완료" 표시. 미작성 시 → /reviews/write?careSessionId=&caregiverId= |
| SOS 버튼 (조건부) | SCHEDULED/IN_PROGRESS 상태일 때만. SOSButton 컴포넌트 |

#### 정산 내역 (/care/settlement)

| 구성 요소 | 내용 |
|---------|------|
| 총계 카드 | 그라데이션 배경. 보호자: "총 지출" / 요양보호사: "총 수입". 완료 건수 |
| 정산 상세 (조건부) | 금액 > 0일 때만. 총 요양비 / 플랫폼 수수료(3%) / 실수령액 |
| 월별 그룹 목록 | 월 합계 + 개별 세션 카드(상대방이름/날짜/시간/금액 +/-/정산상태 Badge) |
| 정산 액션 (조건부) | 보호자이고 PENDING 상태인 세션에만 SettlementActions 컴포넌트 표시 |
| 빈 상태 | "정산 내역이 없어요" |

---

### 2.7 커뮤니티 (/community)

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | "커뮤니티" + 검색바 + CommunityTabs (고정) |
| 탭 카테고리 | ALL / 돌봄이야기(PARENTING) / 요양정보(EDUCATION) / 요양보호사이야기(SITTER) / 질문상담(QNA) / 제도안내(POLICY) / 건강정보(HEALTH) |
| 검색 | 키워드 검색 (q 파라미터) + 정렬 (latest/popular) |
| 게시글 카드 | 카테고리 Badge / 제목 / 내용 excerpt / 이미지(있으면) / 작성자/날짜 / 좋아요·댓글·조회수 |
| 플로팅 글쓰기 버튼 | 우하단 고정, → /community/write |

#### 커뮤니티 상세 (/community/[id])

- 제목/내용/작성자/날짜
- CommunityLikeButton (좋아요 토글)
- 댓글 목록 + 댓글 작성

---

### 2.8 알림 (/notifications)

| 구성 요소 | 내용 |
|---------|------|
| 헤더 | BackHeader "알림", fallback: /home |
| 날짜 그룹 | 오늘/어제/월일 그룹핑 |
| 알림 카드 | 타입별 아이콘(MATCH:파란/MESSAGE:초록/REVIEW:노란/CARE:primary/SYSTEM:회색) + 제목/내용/시간. 미읽음 시 좌측 primary 보더 + 파란 점 |
| 알림 타입 | MATCH, MESSAGE, REVIEW, CARE, SYSTEM |
| 빈 상태 | EmptyState "새로운 알림이 없습니다" |
| 최대 조회 | 50건 |

---

### 2.9 마이페이지 (/my)

#### 공통 상단 프로필 카드

아바타 / 이름 / 역할 Badge(보호자: primary / 요양보호사: blue) / 전화번호 / 수정 링크(→ /my/profile)

#### 보호자 메뉴

| 메뉴 항목 | 경로 |
|---------|------|
| 프로필 수정 | /my/profile |
| 내 리뷰 | /my/reviews |
| 즐겨찾기 | /my/bookmarks |
| 이용권 관리 | /my/pass |
| 어르신 관리 | /my/care-recipients |
| 공동보호자 관리 | /my/co-guardians |
| 돌봄 관리 | /care |
| 정산 내역 | /care/settlement |
| 알림 설정 | /my/settings |

#### 요양보호사 메뉴

| 메뉴 항목 | 경로 |
|---------|------|
| 프로필 수정 | /my/profile |
| 받은 리뷰 | /my/reviews |
| 자격 관리 | /my/certificates |
| 돌봄 관리 | /care |
| 정산 내역 | /care/settlement |
| 알림 설정 | /my/settings |

#### 공통 하단 섹션

- 로그아웃 버튼 (MyPageSignOut)
- 고객센터: 1588-0000, 평일 09:00~18:00
- 버전 정보: v1.0.0
- 이용약관(/terms) / 개인정보처리방침(/privacy) 링크
- 회원탈퇴 링크 → /my/settings

---

#### 마이페이지 하위 페이지

**프로필 수정 (/my/profile)**

| 역할 | 표시 필드 |
|------|---------|
| 공통 | 프로필 이미지(클릭 시 파일 선택 즉시 업로드), 이름, 휴대폰 번호, 지역, 상세 주소, 자기소개 |
| 요양보호사 추가 | 희망 시급, 경력(년), 학력, 제공 서비스(방문요양/방문목욕/방문간호/인지활동/가사지원 다중 선택) |

**즐겨찾기 (/my/bookmarks)** — 보호자 전용

요양보호사 즐겨찾기 목록. 아바타/이름/지역/별점/시급 + 북마크 해제 버튼. 빈 상태 → /search/caregiver

**이용권 관리 (/my/pass)** — 보호자 전용

| 구성 요소 | 내용 |
|---------|------|
| 현재 이용권 상태 | 그라데이션 카드, 현재 "미가입" 표시 |
| 이용권 선택 | 7일권(9,900원) / 30일권(29,900원, 인기) / 90일권(69,900원). 라디오 선택 |
| 혜택 목록 | 선택된 이용권의 혜택 CheckCircle 목록 |
| 구매 버튼 (하단 고정) | 클릭 시 AlertDialog "결제 기능 준비 중" 표시 (미구현) |

**어르신 관리 (/my/care-recipients)** — 보호자 전용

목록에 이름/출생연도/나이/특이사항 표시. 추가/수정: 바텀 슬라이드 모달(이름, 출생연도, 성별, 특이사항). 삭제: ConfirmDialog.

**공동보호자 관리 (/my/co-guardians)** — 보호자 전용

전화번호로 초대. 권한 설정(읽기/읽기+쓰기). 상태(PENDING 대기중/ACCEPTED 수락됨) 표시. 삭제 버튼(X).

**자격 관리 (/my/certificates)** — 요양보호사 전용

7단계 인증 진행 현황.

| 단계 | 항목 |
|------|------|
| 1 | 본인인증 |
| 2 | 자격증 |
| 3 | 신원확인 |
| 4 | 범죄경력 |
| 5 | 건강진단 |
| 6 | 보험가입 |
| 7 | 교육이수 |

각 단계: 완료(초록)/진행중(노란)/미완료(회색) 상태. "서류 제출" 버튼으로 파일 업로드. 완료 N/7 카운터.

**리뷰 관리 (/my/reviews)**

- 보호자: 본인이 작성한 리뷰 목록 (대상 요양보호사 + 별점 + 내용 + 날짜)
- 요양보호사: 본인이 받은 리뷰 목록 (작성자 보호자 + 별점 + 내용 + 날짜)
- 평균 평점 + 총 리뷰 수 요약 카드 (리뷰 있을 때만)

**알림 설정 (/my/settings)**

| 섹션 | 내용 |
|------|------|
| 알림 설정 | 6가지 토글: 매칭(ON)/메시지(ON)/리뷰(ON)/돌봄(ON)/마케팅(OFF)/커뮤니티(ON) |
| 계정 | 비밀번호 변경(바텀 모달, 현재/새/확인 3필드) / 연결된 소셜 계정(준비 중) |
| 정보 | 서비스 이용약관/개인정보처리방침/오픈소스 라이선스/앱 버전(1.0.0) |
| 고객센터 | 1588-0000, 평일 09:00~18:00 |
| 위험 영역 | 회원탈퇴: ConfirmDialog → DELETE /api/users/me → 로그아웃 → / 이동 |

---

### 2.10 기타

#### 긴급 돌봄 (/emergency) — 보호자 전용

| 구성 요소 | 내용 |
|---------|------|
| 긴급 안내 배너 | 빨간 배경, "30분 내 응답 없으면 자동 만료" 안내 |
| 돌봄 대상자 | 등록된 careRecipients 라디오 선택 (없으면 섹션 미표시) |
| 필요 날짜 | 오늘/내일/날짜선택 3버튼 토글 |
| 돌봄 시간 | 2시간/4시간/8시간/종일 4버튼 |
| 돌봄 유형 | 방문요양/병원동행/간병 3버튼 |
| 특이사항 | Textarea (선택, 300자 제한) |
| 제출 버튼 | "긴급 요청 발송" → POST /api/emergency-care → /emergency/waiting?id=&count= 이동 |

#### 긴급 돌봄 대기 (/emergency/waiting)

- 발송된 요청 ID와 전송 건수 표시
- 30분 자동 만료 안내

#### 교육 콘텐츠 (/education) — 요양보호사 전용

| 구성 요소 | 내용 |
|---------|------|
| 탭 | ALL / 필수교육(REQUIRED) / 전문심화(ADVANCED) / 실무(PRACTICAL) / 정서소통(EMOTIONAL) |
| 교육 카드 | 필수/카테고리 Badge / 제목 / 설명 / 소요시간(분) / 수강인원 수 |
| 빈 상태 | "곧 다양한 교육이 준비됩니다" |

#### 교육 상세 (/education/[id]) — 요양보호사 전용

- 교육 콘텐츠 상세 + EducationActions (수강 신청/완료)

#### 포트폴리오 (/portfolio) — 요양보호사 전용

| 구성 요소 | 내용 |
|---------|------|
| 상단 배너 | 그라데이션, 아바타/이름/등급Badge/지역 |
| 통계 카드 | 3개: 총 경력(년), 돌봄 건수, 평균 평점 |
| 평점 추이 (조건부) | 최근 6개월 월별 평점 막대 차트. 데이터 없으면 미표시 |
| 수료한 교육 (조건부) | 완료된 교육 칩 목록. 없으면 미표시 |
| 보호자 추천사 (조건부) | 4점 이상 리뷰 최대 5건. 없으면 미표시 |
| 하단 고정 버튼 | PortfolioShareButton (공유) |

#### 리뷰 작성 (/reviews/write) — 보호자 전용

쿼리 파라미터: `careSessionId`, `caregiverId`

| 구성 요소 | 내용 |
|---------|------|
| 요양보호사 카드 | 아바타 + 이름 (API 조회, 로딩 중 스켈레톤) |
| 항목별 평점 | 5가지 StarRating: 전문성/친절함/신뢰도/시간준수/의사소통 |
| 태그 선택 | 6가지 복수 선택: 치매케어 전문가/정성스러운 케어/소통 잘됨/위생관리 철저/가족처럼 돌봐줌/재이용 의향 |
| 리뷰 작성 | Textarea 20~500자 (글자수 카운터) |
| 제출 조건 | 내용 20자 이상 + 최소 1개 항목 평점 선택 |
| 완료 후 이동 | → /my/reviews |

#### 장기요양등급 안내 (/care-level-guide)

3탭 구조:

| 탭 | 내용 |
|---|------|
| 등급 안내 | 1~5등급 + 인지지원등급 카드. 탭 클릭 시 상세(설명/이용가능서비스/월한도) 펼침. "비용 계산" 탭으로 연결 버튼 |
| 신청 방법 | 4단계 타임라인(신청/방문조사/등급판정위원회/결과통보). 필요서류 체크리스트(4종). 공단 외부링크(longtermcare.or.kr) |
| 비용 계산 | 등급선택/본인부담률(일반15%/의료급여0%/차상위)/서비스 조합(방문요양·방문목욕·주야간보호) → 월 본인부담금 실시간 계산. 한도 초과 경고. 2026년 수가 기준 |

#### 정부지원 안내 (/government-support)

정적 정보 페이지. 로그인 불필요.

#### 이용약관 (/terms), 개인정보처리방침 (/privacy)

정적 콘텐츠 페이지. 로그인 불필요.

---

## 3. 공통 컴포넌트 역할별 분기 표

| 컴포넌트/요소 | 보호자 | 요양보호사 |
|-------------|--------|----------|
| 바텀탭 2번 href | /search/caregiver | /search/guardian |
| 바텀탭 2번 레이블 | 요양보호사찾기 | 일자리찾기 |
| 바텀탭 3번 레이블 | 매칭 | 면접제안 |
| 홈 퀵 액션 1 | 요양보호사 찾기(/search/caregiver) | 일자리 찾기(/search/guardian) |
| 홈 퀵 액션 2 | 매칭 현황(/matching) | 지원 현황(/matching) |
| 홈 퀵 액션 4 | 내 리뷰(/my/reviews) | 자격 관리(/my/certificates) |
| /caregiver/[id] 주 CTA | 면접 제안하기 | 지원하기 |
| /caregiver/[id] 북마크 | 표시 | 미표시 |
| /guardian/[id] 하단 CTA | 미표시 | 지원하기 |
| 매칭 목록 페이지 제목 | 매칭 현황 | 받은 면접 제안 |
| 매칭 빈 상태 CTA | "요양보호사 찾기" → /search/caregiver | "일자리 찾기" → /search/guardian |
| 정산 레이블 | 총 지출 | 총 수입 |
| 정산 금액 부호 | - (지출) | + (수입) |
| 돌봄 목록 상대방 이름 | 요양보호사 이름 | 보호자 이름 |
| /care/[id] 일지 작성 버튼 | 미표시 | COMPLETED 상태일 때만 표시 |
| /care/[id] 리뷰 작성 버튼 | COMPLETED 상태일 때만 표시 | 미표시 |
| 채팅 빈 상태 CTA | "요양보호사 찾기" | "일자리 찾기" |
| 마이페이지 Badge 색상 | primary (파란계열) | blue |
| 마이페이지 리뷰 레이블 | 내 리뷰 (작성한 리뷰) | 받은 리뷰 |

---

## 4. 현재 미구현 항목

### 4.1 역할 가드 클라이언트 사이드 지연

아래 페이지들은 `useSession()` 로딩 완료 전까지 가드가 실행되지 않아 짧게 콘텐츠가 노출될 수 있음:

- /emergency, /my/bookmarks, /my/pass, /my/care-recipients, /my/co-guardians: CAREGIVER 접근 시 /home 리다이렉트 (클라이언트 사이드)
- /my/certificates, /education, /portfolio: GUARDIAN 접근 시 /home 리다이렉트 (클라이언트 사이드)
- /reviews/write: CAREGIVER 접근 시 /home 리다이렉트 (클라이언트 사이드)

### 4.2 마이페이지 메뉴에서 진입 경로 없는 페이지

아래 페이지는 구현되어 있으나 마이페이지 메뉴 링크가 없어 직접 URL 접근만 가능:

| 페이지 | 비고 |
|--------|------|
| /portfolio | 요양보호사 전용. 마이페이지 메뉴 없음 |
| /education | 요양보호사 전용. 마이페이지 메뉴 없음 |
| /care-level-guide | 홈 서비스 카테고리에서 링크 없음 |
| /government-support | 진입 경로 없음 |
| /emergency | 홈 퀵 액션 없음. 직접 URL만 가능 |

### 4.3 커뮤니티 바텀 네비 부재

커뮤니티(/community)는 TAB_PAGES 배열에는 포함(바텀 네비 표시 조건)되어 있으나, NAV_ITEMS(바텀탭 5개 목록)에는 없음. 현재 커뮤니티 진입 경로: 직접 URL만 가능.

### 4.4 결제 기능 미구현

- /my/pass 이용권 구매 버튼: AlertDialog "결제 기능 준비 중" 표시만 함
- 실제 결제 API 미연동

### 4.5 자격 관리 서류 업로드 Mock 처리

- /my/certificates 각 단계의 "서류 제출" 버튼: setTimeout 1.2초 후 상태만 in_progress로 변경하는 목(Mock) 동작
- 실제 파일 업로드 및 관리자 검토 API 미연동

### 4.6 알림 설정 저장 미구현

- /my/settings 알림 토글: 로컬 useState만으로 동작 (페이지 이탈 시 초기화)
- DB 저장 API 미연동

### 4.7 연결된 소셜 계정 미구현

- /my/settings "연결된 소셜 계정": "준비 중인 기능입니다" Toast 표시

### 4.8 SERVICE_PLAN 대비 미구현 기능

PRD/SERVICE_PLAN에 언급되었으나 현재 앱에 없는 기능:

| 기능 | 상태 |
|------|------|
| 영상 통화 | 미구현 |
| 실시간 GPS 위치 공유 (지도 표시) | 체크인/아웃 버튼만 있고 지도 UI 없음 |
| 공동보호자 실제 초대 수락 플로우 | API 연동 후 로컬 state 추가만 됨 |
| 관리자 자격 심사 결과 반영 | /my/certificates Mock 상태 |
| 커뮤니티 바텀 네비 탭 | 없음 |
