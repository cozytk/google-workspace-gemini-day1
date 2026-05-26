<script setup>
import { ref } from 'vue'

const pre = ref(null)

async function copy() {
  const text = pre.value?.innerText?.trimEnd() ?? ''
  if (text) await navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="copy-code">
    <button type="button" @click="copy">복사</button>
    <pre ref="pre"><code><slot /></code></pre>
  </div>
</template>
