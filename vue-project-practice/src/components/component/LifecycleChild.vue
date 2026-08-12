<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)
let timerId = null // setInterval 정리용 id

// setup 실행 시점 - 아직 DOM에 붙기 전이라 화면 요소는 못 만짐
console.log('1. [setup] 컴포넌트 생성')

// DOM에 붙은 직후. API 호출이나 DOM 조작은 보통 여기서 시작
onMounted(() => {
  console.log('2. [onMounted] 마운트 완료')
  // 3초마다 count 증가
  timerId = setInterval(() => {
    count.value++
  }, 3000)
})

// count가 바뀌어서 화면이 다시 그려질 때마다 호출됨
onUpdated(() => {
  console.log(`3. [onUpdated] 리렌더링 (count: ${count.value})`)
})

// 컴포넌트가 사라질 때(v-if로 제거되는 경우 등) 호출됨
onUnmounted(() => {
  clearInterval(timerId) // 안 지우면 컴포넌트가 없어져도 타이머는 계속 돎
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
