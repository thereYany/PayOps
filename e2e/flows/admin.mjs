import { login, logout, productRow, stats, waitForLoginPage } from '../lib/actions.mjs'
import { BASE_URL } from '../lib/browser.mjs'

export async function runAdminCases(runner, page) {
  await runner.step({
    id: 'ADM-01',
    role: '管理员',
    title: '打开登录页',
    expected: '显示登录/注册表单和管理员演示提示',
    shot: '01-admin-login-page.png'
  }, async () => {
    await page.goto(`${BASE_URL}/login`)
    await waitForLoginPage(page)
    return '登录页正常加载'
  })

  await runner.step({
    id: 'ADM-02',
    role: '管理员',
    title: '管理员登录',
    expected: '登录成功并进入管理后台',
    shot: '02-admin-dashboard.png'
  }, async () => {
    await login(page, 'admin', 'admin123', false, 'admin')
    await page.getByRole('heading', { name: '运营与数据' }).waitFor()
    return `后台统计：${(await stats(page)).join(' / ')}`
  })

  await runner.step({
    id: 'ADM-03',
    role: '管理员',
    title: '查看用户和全部订单',
    expected: '管理后台展示用户列表、套餐列表和全部订单',
    shot: '03-admin-users-orders.png'
  }, async () => {
    const userRows = await page.locator('.card').filter({ hasText: '用户列表' }).locator('tbody tr').count()
    const orderRows = await page.locator('.card').filter({ hasText: '全部订单' }).locator('tbody tr').count()
    return `用户 ${userRows} 行，订单 ${orderRows} 行`
  })

  await runner.step({
    id: 'ADM-04',
    role: '管理员',
    title: '新增套餐',
    expected: '新增 20 元 token 套餐，售价 17.00，到账 20.00 token',
    shot: '04-admin-create-product.png'
  }, async () => {
    const inputs = page.locator('.form-card input')
    await inputs.nth(0).fill('20 元 token')
    await inputs.nth(1).fill('17')
    await inputs.nth(2).fill('20')
    await page.locator('.form-card .btn-primary').click()
    await page.getByText('套餐已新增').first().waitFor()
    const row = await productRow(page, '20 元 token')
    await row.waitFor()
    return '20 元 token / ¥17.00 / 20.00 token / 上架'
  })

  await runner.step({
    id: 'ADM-05',
    role: '管理员',
    title: '编辑套餐',
    expected: '套餐名称改为 20 元 token（活动），售价改为 16.00',
    shot: '05-admin-edit-product.png'
  }, async () => {
    const row = await productRow(page, '20 元 token')
    await row.getByRole('button', { name: '编辑' }).click()
    const inputs = page.locator('.form-card input')
    await inputs.nth(0).fill('20 元 token（活动）')
    await inputs.nth(1).fill('16')
    await page.locator('.form-card .btn-primary').click()
    await page.getByText('套餐已更新').first().waitFor()
    const updated = await productRow(page, '20 元 token（活动）')
    await updated.waitFor()
    return '20 元 token（活动） / ¥16.00 / 20.00 token / 上架'
  })

  await runner.step({
    id: 'ADM-06',
    role: '管理员',
    title: '停用套餐',
    expected: '20 元 token（活动）状态变为停用',
    shot: '06-admin-disable-product.png'
  }, async () => {
    const row = await productRow(page, '20 元 token（活动）')
    await row.getByRole('button', { name: '停用' }).click()
    await page.getByText('套餐已停用').first().waitFor()
    await page.locator('tbody tr').filter({ hasText: '20 元 token（活动）' }).first()
      .locator('.status').filter({ hasText: '停用' }).waitFor()
    return '套餐状态：停用'
  })

  await runner.step({
    id: 'ADM-07',
    role: '管理员',
    title: '重新上架套餐',
    expected: '20 元 token（活动）状态恢复为上架',
    shot: '07-admin-enable-product.png'
  }, async () => {
    const row = await productRow(page, '20 元 token（活动）')
    await row.getByRole('button', { name: '上架' }).click()
    await page.getByText('套餐已上架').first().waitFor()
    await page.locator('tbody tr').filter({ hasText: '20 元 token（活动）' }).first()
      .locator('.status').filter({ hasText: '上架' }).waitFor()
    return '套餐状态：上架'
  })

  await runner.step({
    id: 'ADM-08',
    role: '管理员',
    title: '清理测试套餐',
    expected: '测试套餐再次停用，商城只保留三个默认套餐',
    shot: '08-admin-cleanup-product.png'
  }, async () => {
    const row = await productRow(page, '20 元 token（活动）')
    await row.getByRole('button', { name: '停用' }).click()
    await page.getByText('套餐已停用').first().waitFor()
    return '测试套餐已停用'
  })

  await runner.step({
    id: 'ADM-09',
    role: '管理员',
    title: '管理员退出',
    expected: '退出后回到登录页',
    shot: '09-admin-logout.png'
  }, async () => {
    await logout(page)
    return `当前页面：${new URL(page.url()).pathname}`
  })
}
