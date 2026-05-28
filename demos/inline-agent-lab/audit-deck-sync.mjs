#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const root = new URL('.', import.meta.url).pathname
const deck = await fs.readFile(path.join(root, '..', '..', 'slides.md'), 'utf8')
const copyBlock = await fs.readFile(path.join(root, '..', '..', 'components', 'CopyBlock.vue'), 'utf8')
const usage = JSON.parse(await fs.readFile(path.join(root, 'artifacts', 'usage-ledger.json'), 'utf8'))

const expected = `{ ok: true, checked: 7, totalTokens: ${usage.usage.totalTokens} }`
const required = [
  ['CopyBlock.vue', 'node usage-guard.mjs --repeat=5 --maxTokens=2400 --maxUsd=0.02', copyBlock],
  ['CopyBlock.vue', 'node agent-prototype.mjs', copyBlock],
  ['CopyBlock.vue', 'node verify.mjs', copyBlock],
  ['slides.md', expected, deck],
]

const missing = required
  .filter(([, needle, haystack]) => !haystack.includes(needle))
  .map(([file, needle]) => `${file}:${needle}`)
if (missing.length) {
  console.error(`Deck/demo drift detected: ${missing.join(', ')}`)
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, checked: required.length, expected }, null, 2))
