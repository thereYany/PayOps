import { openBrowser } from './lib/browser.mjs'
import { Runner } from './lib/runner.mjs'
import { runAdminCases } from './flows/admin.mjs'
import { runUserCases } from './flows/user.mjs'

const { browser, page } = await openBrowser()
const runner = new Runner(page)
let failed = false

try {
  await runAdminCases(runner, page)
  await runUserCases(runner, page)
} catch (error) {
  failed = true
  console.error('Acceptance stopped:', error)
} finally {
  await runner.save()
  await browser.close()

  const passed = runner.results.filter((item) => item.result === 'PASS').length
  const rejected = runner.results.length - passed
  console.log(`Saved ${runner.results.length} cases: ${passed} passed, ${rejected} failed`)
  process.exitCode = failed || rejected > 0 ? 1 : 0
}
