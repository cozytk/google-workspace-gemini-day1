#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const root = new URL('.', import.meta.url).pathname
const report = await fs.readFile(path.join(root, 'artifacts', 'agent-report.md'), 'utf8')
const usage = JSON.parse(await fs.readFile(path.join(root, 'artifacts', 'usage-ledger.json'), 'utf8'))
const required = ['REQ-001', 'REQ-002', 'REQ-003', 'source=', 'keywords=', '담당자 승인 후 발송', 'usageGuard: PASS']
const missing = required.filter((needle) => !report.includes(needle))
if (missing.length) {
  console.error(`Missing report evidence: ${missing.join(', ')}`)
  process.exit(1)
}
if (!usage.usage.ok || usage.usage.totalTokens > usage.usage.maxTokens) {
  console.error('Usage guard failed')
  process.exit(1)
}
console.log(JSON.stringify({ ok: true, checked: required.length, totalTokens: usage.usage.totalTokens }, null, 2))
