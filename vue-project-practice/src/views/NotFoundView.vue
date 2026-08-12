<script setup>
// 위 라우트 어디에도 매칭되지 않은 경로가 여기로 온다 (router/index.js의 Catch-all Route 참고)
</script>

<template>
  <div class="not-found">
    <p class="code">404</p>
    <h1>페이지를 찾을 수 없어요</h1>
    <p class="desc">주소를 다시 확인하거나, 아래 버튼으로 메인 대시보드로 돌아가 주세요.</p>
    <RouterLink to="/" class="home-link">홈으로 가기</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 16px;
  text-align: center;
}

.code {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--gh-accent);
}

.not-found h1 {
  font-size: 1.2rem;
  color: var(--gh-text);
}

.desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
  margin-bottom: 8px;
}

.home-link {
  padding: 10px 20px;
  border-radius: 999px;
  background: var(--gh-accent);
  color: #041019;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
}
</style>
