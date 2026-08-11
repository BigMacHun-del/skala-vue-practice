<script setup>
import { ref } from 'vue'

 const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 30, status: '맑음' },
  { id: 'city_05', name: '거제', temp: 22, status: '흐림' },
  { id: 'city_06', name: '대전', temp: 27, status: '맑음' },
  { id: 'city_07', name: '울산', temp: 23, status: '비' },
  { id: 'city_08', name: '인천', temp: 25, status: '맑음' },
  { id: 'city_09', name: '강릉', temp: 29, status: '맑음' },
  { id: 'city_10', name: '제주', temp: 21, status: '흐림' },
])

// 검색어 및 알림창 제어용 데이터
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 알림 대행 함수  
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>도시 검색</h3>
      <input type="text" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="검색할 도시 이름 입력" />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <section class="list-box">
      <h3>지역별 날씨 현황</h3>

      <div v-for="item in weatherList" :key="item.id" class="weather-card" @click="selectedCityInfo = `${item.name}이 선택되었습니다.`">
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}°C</p>

        <span v-if="item.temp >= 25" class="badge hot">더움</span>
        <span v-else class="badge cool">선선함</span>

        <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
      </div>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>


<!-- scoped로 해당 컴포넌트 안에서만 적용되는 스타일 -->
<style scoped>
.search-box,
.weather-card,
.status-bar {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.weather-card {
  cursor: pointer;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.badge.hot {
  background: #ffe0e0;
  color: #b71c1c;
}

.badge.cool {
  background: #e0f0ff;
  color: #0d47a1;
}

.btn-detail {
  display: block;
  margin-top: 8px;
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
}
</style>
