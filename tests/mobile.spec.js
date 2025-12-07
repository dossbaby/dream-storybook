import { test, expect } from '@playwright/test';

// 모바일 뷰포트 설정
test.use({ viewport: { width: 375, height: 667 } });

test.describe('모바일 BottomNav 테스트', () => {

  test('BottomNav가 모바일에서 표시됨', async ({ page }) => {
    await page.goto('/');

    // 바텀 네비가 보여야 함
    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();

    // 5개 탭이 있어야 함
    const navItems = page.locator('.bottom-nav-item');
    await expect(navItems).toHaveCount(5);
  });

  test('홈 탭 클릭 시 피드로 이동', async ({ page }) => {
    await page.goto('/');

    // 타로 탭 클릭해서 다른 뷰로 이동
    await page.click('.bottom-nav-item:has-text("타로")');
    await page.waitForTimeout(300);

    // 홈 탭 클릭
    await page.click('.bottom-nav-item:has-text("홈")');
    await page.waitForTimeout(300);

    // 홈 탭이 active 상태여야 함
    const homeTab = page.locator('.bottom-nav-item:has-text("홈")');
    await expect(homeTab).toHaveClass(/active/);
  });

  test('타로 탭 클릭 시 타로 생성 화면으로 이동', async ({ page }) => {
    await page.goto('/');

    // 타로 탭 클릭
    await page.click('.bottom-nav-item:has-text("타로")');
    await page.waitForTimeout(300);

    // 타로 탭이 active 상태여야 함
    const tarotTab = page.locator('.bottom-nav-item:has-text("타로")');
    await expect(tarotTab).toHaveClass(/active/);

    // 타로 입력 화면이 표시되어야 함 (.create-card.tarot-theme)
    await expect(page.locator('.create-card.tarot-theme')).toBeVisible();
  });

  test('꿈 탭 클릭 시 꿈 생성 화면으로 이동', async ({ page }) => {
    await page.goto('/');

    // 꿈 탭 클릭
    await page.click('.bottom-nav-item:has-text("꿈해몽")');
    await page.waitForTimeout(300);

    // 꿈 탭이 active 상태여야 함
    const dreamTab = page.locator('.bottom-nav-item:has-text("꿈해몽")');
    await expect(dreamTab).toHaveClass(/active/);

    // 꿈 입력 화면이 표시되어야 함 (.create-card.dream-theme)
    await expect(page.locator('.create-card.dream-theme')).toBeVisible();
  });

  test('사주 탭 클릭 시 사주 생성 화면으로 이동', async ({ page }) => {
    await page.goto('/');

    // 사주 탭 클릭
    await page.click('.bottom-nav-item:has-text("사주")');
    await page.waitForTimeout(300);

    // 사주 탭이 active 상태여야 함
    const fortuneTab = page.locator('.bottom-nav-item:has-text("사주")');
    await expect(fortuneTab).toHaveClass(/active/);

    // 사주 입력 화면이 표시되어야 함 (.create-card.fortune-theme)
    await expect(page.locator('.create-card.fortune-theme')).toBeVisible();
  });

  test('비로그인 상태에서 마이페이지 접근 시 로그인 유도', async ({ page }) => {
    await page.goto('/');

    // 마이 탭 클릭
    await page.click('.bottom-nav-item:has-text("마이")');
    await page.waitForTimeout(300);

    // 로그인 프롬프트가 표시되어야 함
    await expect(page.locator('.login-prompt')).toBeVisible();
    await expect(page.locator('text=로그인이 필요합니다')).toBeVisible();

    // Google 로그인 버튼이 있어야 함
    await expect(page.locator('.login-prompt-btn')).toBeVisible();
  });

  test('로그인 프롬프트에서 홈으로 돌아가기 동작', async ({ page }) => {
    await page.goto('/');

    // 마이 탭 클릭
    await page.click('.bottom-nav-item:has-text("마이")');
    await page.waitForTimeout(300);

    // 홈으로 돌아가기 클릭
    await page.click('.login-prompt-back');
    await page.waitForTimeout(300);

    // 홈 탭이 active 상태여야 함
    const homeTab = page.locator('.bottom-nav-item:has-text("홈")');
    await expect(homeTab).toHaveClass(/active/);
  });
});

test.describe('모바일 NavBar 테스트', () => {

  test('상단 네비바에서 모드탭이 모바일에서 숨겨짐', async ({ page }) => {
    await page.goto('/');

    // 모드 탭이 보이지 않아야 함
    const modeTabs = page.locator('.nav-mode-tabs');
    await expect(modeTabs).not.toBeVisible();
  });

  test('상단 네비바에서 생성 버튼이 모바일에서 숨겨짐', async ({ page }) => {
    await page.goto('/');

    // 생성 버튼이 보이지 않아야 함
    const createBtn = page.locator('.nav-create-btn');
    await expect(createBtn).not.toBeVisible();
  });

  test('상단 네비바 로고 클릭 시 홈으로 이동', async ({ page }) => {
    await page.goto('/');

    // 다른 뷰로 이동
    await page.click('.bottom-nav-item:has-text("타로")');
    await page.waitForTimeout(300);

    // 로고 클릭
    await page.click('.nav-brand');
    await page.waitForTimeout(300);

    // 홈 탭이 active 상태여야 함
    const homeTab = page.locator('.bottom-nav-item:has-text("홈")');
    await expect(homeTab).toHaveClass(/active/);
  });
});

test.describe('모바일 레이아웃 테스트', () => {

  test('create-card가 모바일에서 전체 너비 사용', async ({ page }) => {
    await page.goto('/');

    // 꿈 탭으로 이동
    await page.click('.bottom-nav-item:has-text("꿈해몽")');
    await page.waitForTimeout(300);

    // create-card가 표시되어야 함
    const createCard = page.locator('.create-card').first();
    await expect(createCard).toBeVisible();

    // 너비 확인 (대략 화면 너비와 비슷해야 함)
    const box = await createCard.boundingBox();
    expect(box.width).toBeGreaterThan(350); // 375px 뷰포트에서 거의 전체 너비
  });

  test('사이드바가 모바일에서 숨겨짐', async ({ page }) => {
    await page.goto('/');

    // 왼쪽 사이드바가 보이지 않아야 함
    const leftSidebar = page.locator('.left-sidebar');
    await expect(leftSidebar).not.toBeVisible();

    // 오른쪽 사이드바가 보이지 않아야 함
    const rightSidebar = page.locator('.right-sidebar');
    await expect(rightSidebar).not.toBeVisible();
  });
});
