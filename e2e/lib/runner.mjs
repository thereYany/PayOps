import fs from 'node:fs/promises'
import path from 'node:path'
import { RESULTS_FILE, SHOT_DIR } from './browser.mjs'

export class Runner {
  constructor(page) {
    this.page = page
    this.results = []
  }

  async screenshot(name) {
    await this.page.evaluate(() => document.fonts.ready)
    await this.page.waitForTimeout(200)
    const file = path.join(SHOT_DIR, name)
    await this.page.screenshot({
      path: file,
      fullPage: true,
      animations: 'disabled',
      caret: 'hide'
    })
    return `screenshots/${name}`
  }

  async step({ id, role, title, expected, shot }, action) {
    const startedAt = new Date().toISOString()
    try {
      const actual = await action()
      const evidence = await this.screenshot(shot)
      this.results.push({
        id,
        role,
        title,
        expected,
        result: 'PASS',
        actual: String(actual),
        evidence,
        startedAt
      })
      console.log(`PASS ${id} ${title} :: ${actual}`)
    } catch (error) {
      const evidence = await this.screenshot(shot).catch(() => null)
      this.results.push({
        id,
        role,
        title,
        expected,
        result: 'FAIL',
        actual: error.message,
        evidence,
        startedAt
      })
      console.error(`FAIL ${id} ${title} :: ${error.message}`)
      throw error
    }
  }

  async save() {
    await fs.mkdir(path.dirname(RESULTS_FILE), { recursive: true })
    await fs.writeFile(RESULTS_FILE, JSON.stringify(this.results, null, 2), 'utf8')
  }
}
