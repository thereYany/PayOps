import {
  buy,
  fillRegisterForm,
  login,
  logout,
  openLoginTab,
  openRegisterTab,
  orderRowCount,
  productCount,
  stats,
  waitForShop
} from '../lib/actions.mjs'
import { BASE_URL } from '../lib/browser.mjs'

export async function runUserCases(runner, page) {
  await runner.step({
    id: 'USR-01',
    role: '用户',
    title: '打开注册表单',
    expected: '切换到注册页，显示用户名、密码、确认密码',
    shot: '10-user-register-form.png'
  }, async () => {
    await openRegisterTab(page)
    return '注册表单已显示'
  })

  await runner.step({
    id: 'USR-02',
    role: '用户',
    title: '注册用户 A',
    expected: '注册 qa_user_a 成功，提示赠送 ¥10.00',
    shot: '11-user-register-success.png'
  }, async () => {
    await fillRegisterForm(page, 'qa_user_a')
    await page.locator('form .btn-primary').click()
    await page.getByText('注册成功，已送 ¥10.00').first().waitFor()
    return 'qa_user_a 注册成功，自动切回登录页'
  })

  await runner.step({
    id: 'USR-03',
    role: '用户',
    title: '勾选记住我',
    expected: '登录表单已填写 qa_user_a，并勾选 7 天免登录',
    shot: '12-user-login-remember.png'
  }, async () => {
    await page.locator('input[autocomplete="username"]').fill('qa_user_a')
    await page.locator('input[autocomplete="current-password"]').fill('secret123')
    await page.locator('input[type="checkbox"]').check()
    return '账号已填写，记住我已勾选'
  })

  await runner.step({
    id: 'USR-04',
    role: '用户',
    title: '用户 A 登录商城',
    expected: '登录成功，余额 ¥10.00，token 0.00，显示三个套餐',
    shot: '13-user-shop.png'
  }, async () => {
    await page.locator('form .btn-primary').click()
    await waitForShop(page)
    return `${(await stats(page)).join(' / ')}，套餐 ${await productCount(page)} 个`
  })

  await runner.step({
    id: 'USR-05',
    role: '用户',
    title: '购买 1 元 token',
    expected: '扣款 ¥0.95，token 到账 1.00，生成一条订单',
    shot: '14-user-buy-1.png'
  }, async () => {
    await buy(page, '1 元 token')
    await page.getByText('¥9.05').first().waitFor()
    return `${(await stats(page)).join(' / ')}，订单 ${await orderRowCount(page)} 条`
  })

  await runner.step({
    id: 'USR-06',
    role: '用户',
    title: '购买 5 元 token',
    expected: '扣款 ¥4.50，token 累计 6.00，生成第二条订单',
    shot: '15-user-buy-5.png'
  }, async () => {
    await buy(page, '5 元 token')
    await page.getByText('¥4.55').first().waitFor()
    return `${(await stats(page)).join(' / ')}，订单 ${await orderRowCount(page)} 条`
  })

  await runner.step({
    id: 'USR-07',
    role: '用户',
    title: '余额不足状态',
    expected: '10 元套餐按钮禁用，显示“余额不足”',
    shot: '16-user-insufficient-balance.png'
  }, async () => {
    const card = page.locator('.product-card').filter({ hasText: '10 元 token' })
    const button = card.getByRole('button')
    const disabled = await button.isDisabled()
    const label = ((await button.textContent()) || '').trim()
    if (!disabled || !label.includes('余额不足')) {
      throw new Error(`按钮状态异常：disabled=${disabled}, label=${label}`)
    }
    return `按钮状态：${label}，disabled=${disabled}`
  })

  await runner.step({
    id: 'USR-08',
    role: '用户',
    title: '查看我的订单',
    expected: '订单列表显示 1 元和 5 元两条已支付订单',
    shot: '17-user-orders.png'
  }, async () => {
    const orderCard = page.locator('.card').filter({ hasText: '我的订单' })
    await orderCard.scrollIntoViewIfNeeded()
    return `订单共 ${await orderRowCount(page)} 条`
  })

  await runner.step({
    id: 'USR-09',
    role: '用户',
    title: '刷新后保持登录',
    expected: '勾选记住我后，刷新页面仍停留在商城',
    shot: '18-user-remember-me.png'
  }, async () => {
    await page.reload()
    await waitForShop(page)
    return `刷新后路径：${new URL(page.url()).pathname}，余额 ${(await stats(page)).join(' / ')}`
  })

  await runner.step({
    id: 'USR-10',
    role: '用户',
    title: '用户访问管理员页面',
    expected: '前端路由拦截，普通用户被重定向回商城',
    shot: '19-user-admin-forbidden.png'
  }, async () => {
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForURL(/\/shop$/)
    await waitForShop(page)
    return `访问 /admin 后被重定向到 ${new URL(page.url()).pathname}`
  })

  await runner.step({
    id: 'USR-11',
    role: '用户',
    title: '用户 A 退出',
    expected: '退出后回到登录页',
    shot: '20-user-a-logout.png'
  }, async () => {
    await logout(page)
    return `当前页面：${new URL(page.url()).pathname}`
  })

  await runner.step({
    id: 'USR-12',
    role: '用户',
    title: '注册用户 B',
    expected: '注册 qa_user_b 成功',
    shot: '21-user-b-register.png'
  }, async () => {
    await fillRegisterForm(page, 'qa_user_b')
    await page.locator('form .btn-primary').click()
    await page.getByText('注册成功，已送 ¥10.00').first().waitFor()
    return 'qa_user_b 注册成功'
  })

  await runner.step({
    id: 'USR-13',
    role: '用户',
    title: '用户 B 不勾选记住我登录',
    expected: '登录成功，记住我未勾选',
    shot: '22-user-b-login.png'
  }, async () => {
    await page.locator('input[autocomplete="username"]').fill('qa_user_b')
    await page.locator('input[autocomplete="current-password"]').fill('secret123')
    const checked = await page.locator('input[type="checkbox"]').isChecked()
    if (checked) {
      throw new Error('用户 B 不应勾选记住我')
    }
    await page.locator('form .btn-primary').click()
    await waitForShop(page)
    return `用户 B 登录成功，记住我=${checked}`
  })

  await runner.step({
    id: 'USR-14',
    role: '用户',
    title: '购买 10 元 token',
    expected: '扣款 ¥8.50，token 到账 10.00，余额剩 ¥1.50',
    shot: '23-user-b-buy-10.png'
  }, async () => {
    await buy(page, '10 元 token')
    await page.getByText('¥1.50').first().waitFor()
    return `${(await stats(page)).join(' / ')}，订单 ${await orderRowCount(page)} 条`
  })

  await runner.step({
    id: 'USR-15',
    role: '用户',
    title: '会话存储刷新验证',
    expected: '未勾选记住我时，刷新当前标签页仍保持登录',
    shot: '24-user-b-session-reload.png'
  }, async () => {
    await page.reload()
    await waitForShop(page)
    return `刷新后路径：${new URL(page.url()).pathname}，余额 ${(await stats(page)).join(' / ')}`
  })

  await runner.step({
    id: 'USR-16',
    role: '用户',
    title: '用户 B 退出',
    expected: '退出后回到登录页',
    shot: '25-user-b-logout.png'
  }, async () => {
    await logout(page)
    return `当前页面：${new URL(page.url()).pathname}`
  })

  await runner.step({
    id: 'USR-17',
    role: '用户',
    title: '重复用户名注册',
    expected: '注册 qa_user_a 时提示“用户名已存在”',
    shot: '26-user-duplicate-register.png'
  }, async () => {
    await fillRegisterForm(page, 'qa_user_a')
    await page.locator('form .btn-primary').click()
    await page.getByText('用户名已存在').first().waitFor()
    return '页面提示：用户名已存在'
  })

  await runner.step({
    id: 'USR-18',
    role: '用户',
    title: '错误密码登录',
    expected: '提示“用户名或密码错误”',
    shot: '27-user-wrong-password.png'
  }, async () => {
    await openLoginTab(page)
    await page.locator('input[autocomplete="username"]').fill('qa_user_a')
    await page.locator('input[autocomplete="current-password"]').fill('wrong-password')
    await page.locator('form .btn-primary').click()
    await page.getByText('用户名或密码错误').first().waitFor()
    return '页面提示：用户名或密码错误'
  })
}
