<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
})

const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

const normalizedSrc = props.src.replace(/^\/+/, '')
const resolvedSrc = `${normalizedBase}${normalizedSrc}`
</script>

<template>
  <img :src="resolvedSrc" :alt="alt" />
</template>
