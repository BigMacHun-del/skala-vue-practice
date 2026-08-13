<script setup>
import { ref, onMounted } from 'vue'
import { fetchKmaBulletins, deriveActiveAlerts } from '@/composables/useKmaAlerts'

// 기상청 특보 API는 전국 단위 발표/해제 이력을 주기 때문에, 지금 떠 있는 특보를 배너로 보여준다
const status = ref('loading') // 'loading' | 'loaded' | 'error'
const alerts = ref([])

onMounted(async () => {
  try {
    const items = await fetchKmaBulletins(30)
    alerts.value = deriveActiveAlerts(items)
    status.value = 'loaded'
  } catch (err) {
    console.error(err)
    status.value = 'error'
  }
})
</script>

<template>
  <!-- API 자체가 실패했을 때만 배너를 통째로 숨긴다 (에러를 굳이 사용자에게 노출하지 않음) -->
  <div v-if="status !== 'error'" class="kma-banner">
    <span class="kma-icon">🚨</span>

    <span v-if="status === 'loading'" class="kma-text">전국 기상특보 확인 중...</span>

    <span v-else-if="alerts.length === 0" class="kma-text">
      현재 발효 중인 기상특보가 없어요 <small>(최근 발표 내역 기준)</small>
    </span>

    <div v-else class="kma-list">
      <span class="kma-text kma-label">전국 기상특보</span>
      <span v-for="a in alerts" :key="a.hazard" class="kma-chip">
        {{ a.hazard }}
        <small>{{ a.time }} 발표</small>
      </span>
    </div>
  </div>
</template>

<style scoped>
.kma-banner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 auto;
  padding: 10px 20px;
  max-width: 960px;
  border-radius: 999px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
}

.kma-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.kma-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.kma-text small {
  font-weight: 500;
  opacity: 0.8;
}

.kma-label {
  color: var(--text);
}

.kma-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.kma-chip {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  padding: 5px 12px;
  border-radius: 999px;
}

.kma-chip small {
  font-weight: 500;
  opacity: 0.85;
}
</style>
