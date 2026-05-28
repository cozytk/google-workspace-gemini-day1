<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  textKey: {
    type: String,
    default: '',
  },
})

const pre = ref(null)

const snippets = {
  geminiRequestPrompt: `당신은 본사 경영관리팀의 업무 요청 분류 담당자입니다.
아래 요청을 계약/정산/인사/기타 중 하나로 분류하고, 긴급도, 근거, 확인 질문, 답장 초안을 표로 작성해 주세요.
근거가 부족하면 '확인 필요'라고 표시하세요.

요청: 해외법인 월간 비용 정산 파일에 누락 행이 있는 것 같습니다. 이번 주 금요일 보고 전까지 확인 가능한가요?`,
  sheetRequestTsv: `요청ID\t부서\t요청내용\t마감일\t분류\t긴급도\t근거\t확인질문
REQ-001\t경영관리\t해외법인 월간 비용 정산 파일에 누락 행이 있는 것 같습니다.\t2026-05-29\t\t\t\t
REQ-002\t인사\t신규 입사자 온보딩 일정과 계정 발급 상태를 확인하고 싶습니다.\t2026-05-28\t\t\t\t
REQ-003\t법무\t계약서 검토 의견을 오늘 중으로 정리해 주세요.\t2026-05-26\t\t\t\t`,
  notebookPolicySource: `[사내 규정 샘플]
- 해외법인 월간 비용 정산은 매월 25일까지 증빙과 함께 제출한다.
- 보고 마감 전 누락 행이 발견되면 원본 증빙, 법인명, 비용 월을 먼저 확인한다.
- 금요일 보고 자료는 목요일 18시까지 1차 검증을 완료한다.
- 데이터 정합성 이슈는 담당자에게 확인 질문을 남기고 수정 로그를 기록한다.`,
  notebookQuestions: `사내 해외법인 비용 정산 절차와 주요 마감 기한을 알려줘.
보고 자료 누락이나 데이터 오류 발생 시 해결 방법은?
정확한 비용 정산을 위해 사전에 검증해야 할 핵심 항목은?`,
  appScriptLogSample: `function classifyRequestSample() {
  const request = {
    requester: 'Kim Hyunwoo',
    type: 'settlement',
    body: 'Overseas monthly expense settlement file may have missing rows.',
    due: '2026-05-29',
  }

  const result = {
    category: 'settlement',
    urgency: 'medium',
    evidence: 'monthly expense settlement, missing rows, Friday report',
    question: 'Confirm target entity and suspected period.',
  }

  console.log(JSON.stringify({ request, result }, null, 2))
}`,
  inlineUsageCommands: `cd demos/inline-agent-lab
node usage-guard.mjs --repeat=5 --maxTokens=2400 --maxUsd=0.02`,
  inlineAgentCommands: `cd demos/inline-agent-lab
node agent-prototype.mjs
node verify.mjs`,
  cliAvailabilityCommands: `codex --version
codex --help | sed -n '1,80p'
claude --version
claude --help | sed -n '1,80p'
agy --version || echo "Antigravity CLI(agy) 또는 데스크톱 앱 확인 필요"`,
}

function currentText() {
  return props.text || snippets[props.textKey] || ''
}

async function copy() {
  const text = currentText() || pre.value?.innerText?.trimEnd() || ''
  if (text) await navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="copy-code">
    <button type="button" @click="copy">복사</button>
    <pre ref="pre"><code>{{ currentText() }}<slot v-if="!currentText()" /></code></pre>
  </div>
</template>
