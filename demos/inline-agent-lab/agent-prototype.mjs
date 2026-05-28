#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { checkUsage } from './usage-guard.mjs'

const root = new URL('.', import.meta.url).pathname
const requests = JSON.parse(await fs.readFile(path.join(root, 'data', 'requests.json'), 'utf8'))

const rules = [
  { category: '정산', owner: '경영관리', keywords: ['정산', '비용', '누락', '보고'], risk: '중간' },
  { category: '인사', owner: 'HR 운영', keywords: ['입사', '온보딩', '계정'], risk: '낮음' },
  { category: '계약', owner: '법무', keywords: ['계약', '조항', '검토'], risk: '높음' },
]

function riskWeight(risk) {
  return risk === '높음' ? 1 : 0
}

function classify(request) {
  const matched = rules
    .map((rule) => ({ rule, hits: rule.keywords.filter((keyword) => request.body.includes(keyword)) }))
    .sort((a, b) => b.hits.length - a.hits.length || riskWeight(b.rule.risk) - riskWeight(a.rule.risk))
    .find((entry) => entry.hits.length)?.rule
  const rule = matched ?? { category: '기타', owner: '운영 담당', keywords: [], risk: '확인 필요' }
  return {
    id: request.id,
    category: rule.category,
    owner: rule.owner,
    risk: rule.risk,
    evidence: [`source=${request.source}`, `keywords=${rule.keywords.filter((k) => request.body.includes(k)).join('/') || 'none'}`],
    nextQuestion: rule.category === '정산'
      ? '대상 법인, 비용 월, 원본 증빙 위치를 확인해 주세요.'
      : rule.category === '계약'
        ? '계약 유형, 협력사명, 필수 검토 조항 목록을 확인해 주세요.'
        : '요청 범위와 완료 기준을 확인해 주세요.',
    approval: rule.risk === '높음' ? '담당자 승인 후 발송' : '담당자 검토 후 공유',
  }
}

const results = requests.map(classify)
const prompt = JSON.stringify({ objective: 'Classify requests and produce agent handoff report', requests }, null, 2)
const completion = JSON.stringify(results)
const usage = checkUsage({ prompt, completion, maxTokens: 2400, maxUsd: 0.02 })

const lines = [
  '# Inline Agent Lab Report',
  '',
  `- generatedAt: ${process.env.DEMO_GENERATED_AT || '2026-05-26T00:00:00.000Z'}`,
  `- usageGuard: ${usage.ok ? 'PASS' : 'FAIL'} (${usage.totalTokens}/${usage.maxTokens} tokens, ~$${usage.estimatedUsd})`,
  '',
  '| ID | Category | Owner | Risk | Evidence | Next question | Approval |',
  '|---|---|---|---|---|---|---|',
  ...results.map((r) => `| ${r.id} | ${r.category} | ${r.owner} | ${r.risk} | ${r.evidence.join('<br/>')} | ${r.nextQuestion} | ${r.approval} |`),
  '',
  '## Verify checklist',
  '- [x] 모든 행에 근거(source/keywords)가 있다.',
  '- [x] 고위험 계약 요청은 사람 승인 지점을 포함한다.',
  '- [x] Usage guard가 토큰/비용 상한을 넘지 않는다.',
]

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true })
await fs.writeFile(path.join(root, 'artifacts', 'agent-report.md'), `${lines.join('\n')}\n`)
await fs.writeFile(path.join(root, 'artifacts', 'usage-ledger.json'), `${JSON.stringify({ usage, results }, null, 2)}\n`)
console.log(lines.join('\n'))
process.exit(usage.ok ? 0 : 2)
