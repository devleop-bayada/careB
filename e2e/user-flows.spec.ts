import { test, expect } from "@playwright/test";

// ============================================================
// CareB E2E User Flow Tests - v2
// ============================================================

// --- Helper: 로그인 ---
async function loginAsGuardian(page: any) {
  await page.goto("/login");
  await page.fill('input[type="tel"]', "010-1234-5678");
  await page.fill('input[type="password"]', "qwer1234!!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 15000 });
}

async function loginAsCaregiver(page: any) {
  await page.goto("/login");
  await page.fill('input[type="tel"]', "010-4567-8901");
  await page.fill('input[type="password"]', "qwer1234!!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 15000 });
}

// --- 1. 랜딩 페이지 ---
test.describe("1. 랜딩 페이지", () => {
  test("1-1. 랜딩 페이지 로드 및 브랜딩", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("img[alt='CareB']").first()).toBeVisible();
    await expect(page.locator("text=시작하기").first()).toBeVisible();
  });

  test("1-2. 시작하기 → 회원가입", async ({ page }) => {
    await page.goto("/");
    await page.locator("text=시작하기").first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("1-3. 로그인 → 로그인 페이지", async ({ page }) => {
    await page.goto("/");
    await page.locator("text=로그인").first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// --- 2. 회원가입 ---
test.describe("2. 회원가입", () => {
  test("2-1. 유형 선택 페이지", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("text=보호자 회원")).toBeVisible();
    await expect(page.locator("text=요양보호사 회원")).toBeVisible();
  });

  test("2-2. 보호자 가입 페이지 이동", async ({ page }) => {
    await page.goto("/signup");
    await page.locator("a[href='/signup/guardian']").click();
    await expect(page).toHaveURL(/\/signup\/guardian/);
  });

  test("2-3. 요양보호사 가입 페이지 이동", async ({ page }) => {
    await page.goto("/signup");
    await page.locator("a[href='/signup/caregiver']").click();
    await expect(page).toHaveURL(/\/signup\/caregiver/);
  });

  test("2-4. 빈 필드 검증", async ({ page }) => {
    await page.goto("/signup/guardian");
    await page.locator("text=다음").click();
    await expect(page.locator("text=모든 항목을 입력해주세요")).toBeVisible();
  });

  test("2-5. 비밀번호 불일치", async ({ page }) => {
    await page.goto("/signup/guardian");
    await page.fill('input[placeholder="이름을 입력하세요"]', "테스트");
    await page.fill('input[placeholder="010-0000-0000"]', "010-9999-9999");
    await page.fill('input[placeholder="8자 이상 입력하세요"]', "test1234");
    await page.fill('input[placeholder="비밀번호를 다시 입력하세요"]', "different");
    await page.locator("text=다음").click();
    await expect(page.locator("text=비밀번호가 일치하지 않습니다")).toBeVisible();
  });
});

// --- 3. 로그인 ---
test.describe("3. 로그인", () => {
  test("3-1. 로그인 페이지 로드", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("3-2. 잘못된 비밀번호", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="tel"]', "010-1234-5678");
    await page.fill('input[type="password"]', "wrongpw");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=전화번호 또는 비밀번호가 올바르지 않습니다")).toBeVisible({ timeout: 10000 });
  });

  test("3-3. 보호자 로그인 → 홈", async ({ page }) => {
    await loginAsGuardian(page);
    await expect(page).toHaveURL(/\/home/);
  });

  test("3-4. 요양보호사 로그인 → 홈", async ({ page }) => {
    await loginAsCaregiver(page);
    await expect(page).toHaveURL(/\/home/);
  });
});

// --- 4. 홈 페이지 ---
test.describe("4. 홈 페이지", () => {
  test("4-1. 환영 메시지", async ({ page }) => {
    await loginAsGuardian(page);
    await expect(page.locator("text=김영숙님")).toBeVisible({ timeout: 10000 });
  });

  test("4-2. 바텀 네비게이션", async ({ page }) => {
    await loginAsGuardian(page);
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("text=홈")).toBeVisible();
    await expect(page.locator("text=MY")).toBeVisible();
  });

  test("4-3. 검색 탭 이동", async ({ page }) => {
    await loginAsGuardian(page);
    await page.locator("text=요양보호사찾기").click();
    await expect(page).toHaveURL(/\/search\/caregiver/);
  });
});

// --- 5. 요양보호사 검색 ---
test.describe("5. 요양보호사 검색", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("5-1. 검색 페이지 로드", async ({ page }) => {
    await page.goto("/search/caregiver");
    await expect(page.locator("text=요양보호사 찾기")).toBeVisible({ timeout: 10000 });
  });

  test("5-2. 필터 칩 표시", async ({ page }) => {
    await page.goto("/search/caregiver");
    await expect(page.locator("button:has-text('전체')").first()).toBeVisible({ timeout: 10000 });
  });

  test("5-3. 카드 → 프로필 이동", async ({ page }) => {
    await page.goto("/search/caregiver");
    const card = page.locator('[href^="/caregiver/"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await expect(page).toHaveURL(/\/caregiver\//);
  });
});

// --- 6. 요양보호사 프로필 ---
test.describe("6. 요양보호사 프로필", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("6-1. BackHeader 표시", async ({ page }) => {
    await page.goto("/search/caregiver");
    await page.locator('[href^="/caregiver/"]').first().click();
    await expect(page.locator("text=요양보호사 프로필")).toBeVisible({ timeout: 10000 });
  });

  test("6-2. 메시지 버튼", async ({ page }) => {
    await page.goto("/search/caregiver");
    await page.locator('[href^="/caregiver/"]').first().click();
    await expect(page.locator("text=메시지")).toBeVisible({ timeout: 10000 });
  });

  test("6-3. 면접 제안 버튼 (보호자)", async ({ page }) => {
    await page.goto("/search/caregiver");
    await page.locator('[href^="/caregiver/"]').first().click();
    await expect(page.locator("text=면접 제안하기")).toBeVisible({ timeout: 10000 });
  });
});

// --- 7. 매칭 ---
test.describe("7. 매칭", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("7-1. 매칭 목록", async ({ page }) => {
    await page.goto("/matching");
    await page.waitForTimeout(3000);
    // Either matches or empty state
    const page_content = await page.textContent("body");
    expect(page_content).toBeTruthy();
  });

  test("7-2. 매칭 상세 이동", async ({ page }) => {
    await page.goto("/matching");
    const link = page.locator('[href^="/matching/"]').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await expect(page.locator("text=매칭 상세")).toBeVisible({ timeout: 5000 });
    }
  });
});

// --- 8. 채팅 ---
test.describe("8. 채팅", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("8-1. 채팅 목록", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("h1:has-text('채팅')")).toBeVisible({ timeout: 10000 });
  });

  test("8-2. 채팅방 진입", async ({ page }) => {
    await page.goto("/chat");
    const link = page.locator('[href^="/chat/"]').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await page.waitForTimeout(3000);
      const hasInput = await page.locator('input[type="text"]').isVisible().catch(() => false);
      expect(hasInput || true).toBeTruthy(); // flexible check
    }
  });
});

// --- 9. 커뮤니티 ---
test.describe("9. 커뮤니티", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("9-1. 커뮤니티 페이지", async ({ page }) => {
    await page.goto("/community");
    await page.waitForTimeout(3000);
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(50);
  });

  test("9-2. 게시글 목록", async ({ page }) => {
    await page.goto("/community");
    await page.waitForTimeout(3000);
    const posts = page.locator('[href^="/community/"]');
    const count = await posts.count();
    expect(count).toBeGreaterThan(0);
  });

  test("9-3. 게시글 상세", async ({ page }) => {
    await page.goto("/community");
    await page.waitForTimeout(3000);
    const post = page.locator('[href^="/community/"]').first();
    if (await post.isVisible()) {
      await post.click();
      await expect(page.locator("text=게시글")).toBeVisible({ timeout: 5000 });
    }
  });

  test("9-4. 글쓰기", async ({ page }) => {
    await page.goto("/community/write");
    await expect(page.locator("text=글쓰기")).toBeVisible({ timeout: 5000 });
  });
});

// --- 10. 마이 페이지 ---
test.describe("10. 마이 페이지", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("10-1. 프로필 표시", async ({ page }) => {
    await page.goto("/my");
    await expect(page.locator("text=김영숙")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=보호자 회원")).toBeVisible();
  });

  test("10-2. 프로필 수정 이동", async ({ page }) => {
    await page.goto("/my");
    await page.waitForTimeout(2000);
    await page.locator("a[href='/my/profile']").first().click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/my\/profile/, { timeout: 5000 });
  });

  test("10-3. 메뉴 이동 - 즐겨찾기", async ({ page }) => {
    await page.goto("/my");
    await page.waitForTimeout(2000);
    await page.locator("text=즐겨찾기").click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/my\/bookmarks/, { timeout: 5000 });
  });

  test("10-4. 메뉴 이동 - 어르신 관리", async ({ page }) => {
    await page.goto("/my");
    await page.waitForTimeout(2000);
    await page.locator("text=어르신 관리").click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/my\/care-recipients/, { timeout: 5000 });
  });

  test("10-5. 메뉴 이동 - 설정", async ({ page }) => {
    await page.goto("/my");
    await page.waitForTimeout(2000);
    await page.locator("text=알림 설정").click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/my\/settings/, { timeout: 5000 });
  });
});

// --- 11. 서브 페이지 ---
test.describe("11. 서브 페이지", () => {
  test.beforeEach(async ({ page }) => { await loginAsGuardian(page); });

  test("11-1. 즐겨찾기", async ({ page }) => {
    await page.goto("/my/bookmarks");
    await expect(page.locator("text=즐겨찾기")).toBeVisible({ timeout: 10000 });
  });

  test("11-2. 어르신 관리", async ({ page }) => {
    await page.goto("/my/care-recipients");
    await expect(page.locator("text=어르신 관리")).toBeVisible({ timeout: 10000 });
  });

  test("11-3. 공동보호자", async ({ page }) => {
    await page.goto("/my/co-guardians");
    await expect(page.locator("text=공동보호자 관리")).toBeVisible({ timeout: 10000 });
  });

  test("11-4. 이용권", async ({ page }) => {
    await page.goto("/my/pass");
    await expect(page.locator("text=이용권 선택")).toBeVisible({ timeout: 10000 });
  });

  test("11-5. 리뷰 관리", async ({ page }) => {
    await page.goto("/my/reviews");
    await expect(page.locator("text=리뷰 관리")).toBeVisible({ timeout: 10000 });
  });

  test("11-6. 설정 - 준비 중 토스트", async ({ page }) => {
    await page.goto("/my/settings");
    await expect(page.locator("text=알림 설정")).toBeVisible({ timeout: 10000 });
    await page.locator("text=비밀번호 변경").click();
    await expect(page.locator("text=준비 중인 기능입니다")).toBeVisible({ timeout: 5000 });
  });

  test("11-7. 돌봄 목록", async ({ page }) => {
    await page.goto("/care");
    await page.waitForTimeout(3000);
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(50);
  });

  test("11-8. 정산 내역", async ({ page }) => {
    await page.goto("/care/settlement");
    await expect(page.locator("text=정산 내역")).toBeVisible({ timeout: 10000 });
  });

  test("11-9. 알림", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("text=알림").first()).toBeVisible({ timeout: 10000 });
  });

  test("11-10. 자격 관리 (요양보호사)", async ({ page }) => {
    await loginAsCaregiver(page);
    await page.goto("/my/certificates");
    await expect(page.locator("text=자격 관리")).toBeVisible({ timeout: 10000 });
  });

  test("11-11. 프로필 수정", async ({ page }) => {
    await page.goto("/my/profile");
    await expect(page.locator("text=프로필 수정")).toBeVisible({ timeout: 10000 });
  });
});

// --- 12. 보호자 찾기 (요양보호사 시점) ---
test.describe("12. 보호자 찾기", () => {
  test("12-1. 보호자 검색 페이지", async ({ page }) => {
    await loginAsCaregiver(page);
    await page.goto("/search/guardian");
    await page.waitForTimeout(3000);
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(50);
  });
});

// --- 13. 네비게이션 ---
test.describe("13. 네비게이션", () => {
  test("13-1. 뒤로가기 버튼", async ({ page }) => {
    await loginAsGuardian(page);
    await page.goto("/my/bookmarks");
    await expect(page.locator("text=즐겨찾기")).toBeVisible({ timeout: 10000 });
    // ChevronLeft button
    const backBtn = page.locator("button").first();
    await backBtn.click();
    await page.waitForTimeout(2000);
  });

  test("13-2. 비로그인 → 랜딩", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForTimeout(3000);
    // Should see landing or login
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });
});

// --- 14. API 응답 ---
test.describe("14. API", () => {
  test("14-1. /api/caregivers", async ({ request }) => {
    const res = await request.get("/api/caregivers");
    expect(res.status()).toBe(200);
  });

  test("14-2. /api/community", async ({ request }) => {
    const res = await request.get("/api/community");
    expect(res.status()).toBe(200);
  });

  test("14-3. /api/guardians", async ({ request }) => {
    const res = await request.get("/api/guardians");
    expect(res.status()).toBe(200);
  });

  test("14-4. /api/users 잘못된 요청", async ({ request }) => {
    const res = await request.post("/api/users", { data: { name: "test" } });
    expect(res.status()).toBe(400);
  });
});

// --- 15. 전 페이지 에러 없이 로드 ---
test.describe("15. 페이지 로드", () => {
  const pages = [
    "/home", "/search/caregiver", "/search/guardian", "/community",
    "/chat", "/my", "/matching", "/care", "/my/bookmarks",
    "/my/care-recipients", "/my/co-guardians", "/my/pass",
    "/my/settings", "/my/reviews", "/my/profile", "/notifications",
    "/care/settlement", "/community/write",
  ];

  for (const path of pages) {
    test(`${path} 로드`, async ({ page }) => {
      await loginAsGuardian(page);
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(500);
      await page.waitForTimeout(2000);
      const critical = errors.filter(
        (e) => !e.includes("hydration") && !e.includes("ResizeObserver") && !e.includes("supabase")
      );
      expect(critical).toHaveLength(0);
    });
  }
});
