<script setup>
// 정적 소개 페이지 - 상태 없이 텍스트 + 뒤로가기 링크만 있는 View
</script>

<template>
  <div class="about-view">
    <h1>웨더튠 Router 실습</h1>
    <p>날씨 등급에 따라 어울리는 노래를 추천해주는 웨더튠 프로젝트를, Vue Router로 페이지를 나눠본 실습 버전이에요.</p>
    <p>지도에서 도시를 눌러 상세보기를 열면 <code>/weather/:cityId</code> 동적 경로로 이동하고, 존재하지 않는 경로로 가면 404 페이지가 뜹니다.</p>
    <RouterLink to="/" class="back-link">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--gh-text);
}

.about-view p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--gh-text-secondary);
}

.about-view code {
  background: var(--gh-bg-inset);
  border: 1px solid var(--gh-border-muted);
  border-radius: 4px;
  padding: 1px 6px;
}

.back-link {
  align-self: flex-start;
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gh-accent);
  text-decoration: none;
}
</style>
