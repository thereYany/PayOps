import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'
export const ROOT_DIR = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
export const ARTIFACT_DIR = path.join(ROOT_DIR, 'docs/acceptance/v1.0')
export const SHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots')
export const RESULTS_FILE = path.join(ARTIFACT_DIR, 'run-results.json')

const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean)

const executablePath = candidates.find(existsSync)
if (!executablePath) {
  throw new Error('No Chrome or Edge executable found')
}

export async function openBrowser() {
  await fs.mkdir(SHOT_DIR, { recursive: true })
  const browser = await chromium.launch({ executablePath, headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    deviceScaleFactor: 1
  })
  const page = await context.newPage()
  return { browser, context, page }
}
