import { BASE_URL } from './browser.mjs'

export async function waitForLoginPage(page) {
  await page.getByRole('heading', { name: '欢迎回来' }).waitFor()
}

export async function waitForShop(page) {
  await page.getByRole('heading', { name: '选择你的 token 套餐' }).waitFor()
  await page.locator('.product-card').first().waitFor()
}

export async function login(page, username, password, rememberMe = false, target = 'shop') {
  await page.goto(`${BASE_URL}/login`)
  await waitForLoginPage(page)
  await page.locator('input[autocomplete="username"]').fill(username)
  await page.locator('input[autocomplete="current-password"]').fill(password)
  if (rememberMe) {
    await page.locator('input[type="checkbox"]').check()
  }
  await page.locator('form .btn-primary').click()
  if (target === 'admin') {
    await page.getByRole('heading', { name: '运营与数据' }).waitFor()
  } else {
    await waitForShop(page)
  }
}

export async function logout(page) {
  await page.getByRole('button', { name: '退出' }).click()
  await waitForLoginPage(page)
}

export async function stats(page) {
  return (await page.locator('.stat-value').allTextContents()).map((value) => value.trim())
}

export async function productCount(page) {
  return page.locator('.product-card').count()
}

export async function orderRowCount(page) {
  return page.locator('.card').filter({ hasText: '我的订单' }).locator('tbody tr').count()
}

export async function buy(page, productName) {
  const card = page.locator('.product-card').filter({ hasText: productName })
  await card.getByRole('button').click()
  await page.getByText(`已购买 ${productName}`).first().waitFor()
}

export async function openRegisterTab(page) {
  await page.locator('.tab').filter({ hasText: '注册' }).click()
  await page.getByRole('heading', { name: '创建账号' }).waitFor()
}

export async function openLoginTab(page) {
  await page.locator('.tab').filter({ hasText: '登录' }).click()
  await waitForLoginPage(page)
}

export async function fillRegisterForm(page, username, password = 'secret123') {
  await openRegisterTab(page)
  await page.locator('input[autocomplete="username"]').fill(username)
  const passwords = page.locator('input[autocomplete="new-password"]')
  await passwords.nth(0).fill(password)
  await passwords.nth(1).fill(password)
}

export async function productRow(page, name) {
  return page.locator('tbody tr').filter({ hasText: name }).first()
}
