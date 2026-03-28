import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); // iPhone 14 size
  const page = await context.newPage();

  const screenshots: string[] = [];

  async function snap(name: string) {
    const path = `e2e/screenshots/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push(path);
    console.log(`✅ ${name}`);
  }

  // 1. 랜딩
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  await snap("01-landing");

  // 2. 로그인 페이지
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await snap("02-login-page");

  // 3. 회원가입 선택
  await page.goto(`${BASE}/signup`);
  await page.waitForTimeout(1000);
  await snap("03-signup-select");

  // 4. 보호자 회원가입
  await page.goto(`${BASE}/signup/guardian`);
  await page.waitForTimeout(1000);
  await snap("04-signup-guardian");

  // 5. 요양보호사 회원가입
  await page.goto(`${BASE}/signup/caregiver`);
  await page.waitForTimeout(1000);
  await snap("05-signup-caregiver");

  // 6. 로그인 실행
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="tel"]', "010-1234-5678");
  await page.fill('input[type="password"]', "qwer1234!!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 15000 });
  await page.waitForTimeout(2000);
  await snap("06-home");

  // 7. 요양보호사 검색
  await page.goto(`${BASE}/search/caregiver`);
  await page.waitForTimeout(3000);
  await snap("07-search-caregiver");

  // 8. 요양보호사 프로필 상세
  const caregiverLink = page.locator('[href^="/caregiver/"]').first();
  if (await caregiverLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await caregiverLink.click();
    await page.waitForTimeout(3000);
    await snap("08-caregiver-profile");
  }

  // 9. 매칭 목록
  await page.goto(`${BASE}/matching`);
  await page.waitForTimeout(3000);
  await snap("09-matching-list");

  // 10. 매칭 상세
  const matchLink = page.locator('[href^="/matching/"]').first();
  if (await matchLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await matchLink.click();
    await page.waitForTimeout(3000);
    await snap("10-matching-detail");
  }

  // 11. 채팅 목록
  await page.goto(`${BASE}/chat`);
  await page.waitForTimeout(3000);
  await snap("11-chat-list");

  // 12. 채팅 상세
  const chatLink = page.locator('[href^="/chat/"]').first();
  if (await chatLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await chatLink.click();
    await page.waitForTimeout(3000);
    await snap("12-chat-detail");
  }

  // 13. 커뮤니티
  await page.goto(`${BASE}/community`);
  await page.waitForTimeout(3000);
  await snap("13-community");

  // 14. 커뮤니티 상세
  const postLink = page.locator('[href^="/community/"]').first();
  if (await postLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await postLink.click();
    await page.waitForTimeout(3000);
    await snap("14-community-detail");
  }

  // 15. 글쓰기
  await page.goto(`${BASE}/community/write`);
  await page.waitForTimeout(2000);
  await snap("15-community-write");

  // 16. 마이페이지
  await page.goto(`${BASE}/my`);
  await page.waitForTimeout(2000);
  await snap("16-my-page");

  // 17. 프로필 수정
  await page.goto(`${BASE}/my/profile`);
  await page.waitForTimeout(2000);
  await snap("17-profile-edit");

  // 18. 즐겨찾기
  await page.goto(`${BASE}/my/bookmarks`);
  await page.waitForTimeout(2000);
  await snap("18-bookmarks");

  // 19. 어르신 관리
  await page.goto(`${BASE}/my/care-recipients`);
  await page.waitForTimeout(2000);
  await snap("19-care-recipients");

  // 20. 공동보호자
  await page.goto(`${BASE}/my/co-guardians`);
  await page.waitForTimeout(2000);
  await snap("20-co-guardians");

  // 21. 이용권
  await page.goto(`${BASE}/my/pass`);
  await page.waitForTimeout(2000);
  await snap("21-pass");

  // 22. 설정
  await page.goto(`${BASE}/my/settings`);
  await page.waitForTimeout(2000);
  await snap("22-settings");

  // 23. 리뷰
  await page.goto(`${BASE}/my/reviews`);
  await page.waitForTimeout(2000);
  await snap("23-reviews");

  // 24. 알림
  await page.goto(`${BASE}/notifications`);
  await page.waitForTimeout(2000);
  await snap("24-notifications");

  // 25. 돌봄 목록
  await page.goto(`${BASE}/care`);
  await page.waitForTimeout(3000);
  await snap("25-care-list");

  // 26. 정산
  await page.goto(`${BASE}/care/settlement`);
  await page.waitForTimeout(2000);
  await snap("26-settlement");

  // 27. 보호자 검색 (요양보호사 시점)
  await page.context().clearCookies();
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="tel"]', "010-4567-8901");
  await page.fill('input[type="password"]', "qwer1234!!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/home", { timeout: 15000 });
  await page.waitForTimeout(2000);
  await snap("27-home-caregiver");

  await page.goto(`${BASE}/search/guardian`);
  await page.waitForTimeout(3000);
  await snap("28-search-guardian");

  // 29. 자격관리
  await page.goto(`${BASE}/my/certificates`);
  await page.waitForTimeout(2000);
  await snap("29-certificates");

  console.log(`\n📸 Total: ${screenshots.length} screenshots captured`);
  await browser.close();
}

run().catch(console.error);
