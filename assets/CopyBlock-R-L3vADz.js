import{R as e,V as t,g as n,st as r,v as i,x as a,y as o,yt as s}from"./modules/shiki-CoBJKRyX.js";import{rt as c}from"./index-OP9TfeLu.js";var l={class:`copy-code`},u={__name:`CopyBlock`,props:{text:{type:String,default:``},textKey:{type:String,default:``}},setup(u){let{$slidev:d,$nav:f,$clicksContext:p,$clicks:m,$page:h,$renderContext:g,$frontmatter:_}=c(),v=u,y=r(null),b={geminiRequestPrompt:`당신은 회사의 공용 요청함을 관리하는 업무 코디네이터입니다.
아래 요청을 IT지원/구매/인사총무/회계/고객문의/기타 중 하나로 분류하고, 긴급도, 담당 후보, 판단 근거, 확인 질문, 3문장 답장 초안을 표로 작성해 주세요.
근거가 부족하면 '확인 필요'라고 표시하고, 실제 처리 확정처럼 쓰지 마세요.

요청: 노트북 VPN 접속이 되지 않아 오늘 오후 고객 미팅 자료를 열 수 없습니다. 임시 접속 방법이나 담당자 연결을 부탁드립니다.`,sheetRequestTsv:`요청ID	채널	요청자	제목	본문	희망기한	분류	긴급도	담당후보	다음조치
REQ-001	Form	김현우	노트북 VPN 접속 오류	오늘 오후 고객 미팅 자료를 열 수 없어 임시 접속 방법이 필요합니다.	2026-05-28 14:00				
REQ-002	Gmail	박민지	공용 모니터 구매 가능 여부	팀 공용 모니터 2대 구매 가능 여부와 필요한 승인 절차를 알고 싶습니다.	2026-05-31				
REQ-003	Form	이서연	재직증명서 발급 요청	은행 제출용 재직증명서 발급 가능 일정과 신청 방법을 알려 주세요.	2026-05-30				
REQ-004	Gmail	정다은	세금계산서 재발행 문의	거래처에서 지난달 세금계산서 재발행을 요청했습니다. 확인 절차가 필요합니다.	2026-05-29				
REQ-005	Form	최지훈	신규 입사자 OT 일정 조율	다음 주 신규 입사자 3명의 OT 일정을 캘린더에 잡아 주세요.	2026-06-02				
REQ-006	Gmail	한유리	프로젝트 자료 폴더 공유	외부 미팅 전에 프로젝트 소개 자료 폴더 링크를 공유받고 싶습니다.	2026-05-28 17:00				`,notebookPolicySource:`[요청 처리 규정 샘플]
- IT 장애 요청은 업무 차질 시간이 4시간 이내이면 긴급으로 표시하고 IT지원 담당자에게 먼저 배정한다.
- 구매 문의는 품목, 수량, 예상 금액, 사용 목적이 없으면 확인 질문을 남긴다.
- 인사총무 증명서 요청은 제출처와 희망 발급일을 확인한 뒤 처리 가능 일정을 안내한다.
- 회계 재발행 요청은 거래처명, 발행월, 원본 문서 번호를 확인해야 한다.
- 일정 조율 요청은 참석자, 목적, 후보 시간을 확인한 뒤 Calendar 초안 이벤트로 만든다.
- 외부 공유가 필요한 Drive 링크는 공유 범위를 확인한 뒤 발송한다.
- 모든 자동 답장은 최종 처리 확정이 아니라 접수 확인과 다음 확인 질문까지만 포함한다.`,notebookQuestions:`REQ-001 VPN 요청은 어떤 기준 때문에 긴급인가요?
REQ-002 구매 문의에 답장하기 전에 꼭 물어봐야 할 정보는?
REQ-004 세금계산서 재발행 요청의 확인 절차를 3단계로 정리해 주세요.`,appScriptLogSample:`function classifyRequestSample() {
  const request = {
    id: 'REQ-001',
    requester: 'Kim Hyunwoo',
    channel: 'Google Form',
    body: 'VPN 접속 오류로 오늘 오후 고객 미팅 자료를 열 수 없습니다.',
    due: '2026-05-28 14:00',
  }

  const result = {
    category: 'IT지원',
    urgency: '높음',
    evidence: '오늘 오후 고객 미팅, VPN 접속 불가',
    question: '사용 기기와 오류 화면을 확인하세요.',
  }

  console.log(JSON.stringify({ request, result }, null, 2))
}`,formRequestFields:`요청자 이메일
요청 제목
요청 유형: IT지원 / 구매 / 인사총무 / 회계 / 고객문의 / 기타
요청 내용
희망 처리 기한
첨부/Drive 링크`,appScriptDraftPipeline:`function onFormSubmit(e) {
  const row = e.values
  const requester = row[1]
  const title = row[2]
  const requestType = row[3]
  const due = row[5]

  GmailApp.createDraft(
    requester,
    '[접수 완료] ' + title,
    requestType + ' 요청을 접수했습니다. 희망 기한: ' + due +
      '\\n담당자 확인 후 다음 확인 질문과 함께 회신드리겠습니다.'
  )
}`,inlineUsageCommands:`cd demos/inline-agent-lab
node usage-guard.mjs --repeat=5 --maxTokens=2400 --maxUsd=0.02`,inlineAgentCommands:`cd demos/inline-agent-lab
node agent-prototype.mjs
node verify.mjs`,cliAvailabilityCommands:`codex --version
codex --help | sed -n '1,80p'
claude --version
claude --help | sed -n '1,80p'
agy --version || echo "Antigravity CLI(agy) 또는 데스크톱 앱 확인 필요"`};function x(){return v.text||b[v.textKey]||``}async function S(){let e=x()||y.value?.innerText?.trimEnd()||``;e&&await navigator.clipboard.writeText(e)}return(r,c)=>(e(),o(`div`,l,[n(`button`,{type:`button`,onClick:S},`복사`),n(`pre`,{ref_key:`pre`,ref:y},[n(`code`,null,[a(s(x()),1),x()?i(`v-if`,!0):t(r.$slots,`default`,{key:0})])],512)]))}};export{u as t};