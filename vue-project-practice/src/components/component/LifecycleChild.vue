<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)
let timerId = null

console.log('1. [setup] 컴포넌트 생성')

onMounted(() => {
  console.log('2. [onMounted] 마운트 완료')
  timerId = setInterval(() => {
    count.value++
  }, 3000)
})

onUpdated(() => {
  console.log(`3. [onUpdated] 리렌더링 (count: ${count.value})`)
})

onUnmounted(() => {
  clearInterval(timerId)
  console.log('4. [onUnmounted] 타이머 정리 후 소멸')
})
</script>

<template>
  <h3>⏱️ 라이프사이클 훅 흐름 탐색기</h3>
  <div class="counter-display">
    <p>실시간 타이머 카운트: {{ count }}</p>
    <button @click="count++">수동으로 숫자 올리기</button>
  </div>
</template>

<style scoped>
.counter-display {
  background: #e3fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #99e9f2;
  text-align: center;
}
</style>
