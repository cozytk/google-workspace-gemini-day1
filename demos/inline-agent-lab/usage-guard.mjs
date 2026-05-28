#!/usr/bin/env node
/** @type {Record<string, string>} */
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = ''] = arg.replace(/^--/, '').split('=')
  return [key, value]
}))

export function estimateTokens(text) {
  return Math.ceil(String(text).length / 3.6)
}

export function checkUsage({ prompt, completion = '', maxTokens = 8000, maxUsd = 0.25, pricePerMTok = 1.5 }) {
  const inputTokens = estimateTokens(prompt)
  const outputTokens = estimateTokens(completion)
  const totalTokens = inputTokens + outputTokens
  const estimatedUsd = (totalTokens / 1_000_000) * pricePerMTok
  return {
    inputTokens,
    outputTokens,
    totalTokens,
    maxTokens: Number(maxTokens),
    estimatedUsd: Number(estimatedUsd.toFixed(6)),
    maxUsd: Number(maxUsd),
    ok: totalTokens <= Number(maxTokens) && estimatedUsd <= Number(maxUsd),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const demoPrompt = String(args.prompt || 'Plan→Execute→Verify agent lab for three Workspace requests.')
  const result = checkUsage({
    prompt: demoPrompt.repeat(Number(args.repeat ?? 1)),
    completion: String(args.completion || 'verified'),
    maxTokens: Number(args.maxTokens || 8000),
    maxUsd: Number(args.maxUsd || 0.25),
    pricePerMTok: Number(args.pricePerMTok || 1.5),
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.ok ? 0 : 2)
}
