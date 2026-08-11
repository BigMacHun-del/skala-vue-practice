<script setup>
import { ref } from 'vue'

/**
 * 기상청 폭염/한파 특보 기준을 단순화하여 기온별 등급을 판정하는 함수
 * param {number} temp - 현재 기온(°C)
 * returns {{label: string, class: string}} 화면에 표시할 문구와 배지에 적용할 CSS 클래스
 */
const getWeatherAlert = (temp) => {
  if (temp >= 35) return { label: '폭염경보', class: 'heat-warning' }
  if (temp >= 33) return { label: '폭염주의보', class: 'heat-caution' }
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= -12) return { label: '한파경보', class: 'cold-warning' }
  if (temp <= -5) return { label: '한파주의보', class: 'cold-caution' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

const rawCities = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 18, status: '비' },
  { id: 'city_03', name: '부산', temp: 33, status: '흐림' },
  { id: 'city_04', name: '대구', temp: 36, status: '맑음' },
  { id: 'city_05', name: '거제', temp: 22, status: '구름' },
  { id: 'city_06', name: '대전', temp: -3, status: '눈' },
  { id: 'city_07', name: '울산', temp: -8, status: '강풍' },
  { id: 'city_08', name: '인천', temp: -14, status: '눈' },
  { id: 'city_09', name: '강릉', temp: 30, status: '맑음' },
  { id: 'city_10', name: '제주', temp: 19, status: '비' },
  { id: 'city_11', name: '평창', temp: -16, status: '폭설' },
  { id: 'city_12', name: '포항', temp: 35, status: '맑음' },
]

// rawCities 각 도시에 getWeatherAlert 결과(alert 필드)를 미리 계산해 붙여서 반응형 데이터로 만듦
const weatherList = ref(rawCities.map((city) => ({ ...city, alert: getWeatherAlert(city.temp) })))

// 검색어 및 알림창 제어용 데이터
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

/**
 * 상세보기 버튼 클릭 시 해당 도시의 날씨 상태를 alert 창으로 보여주는 함수
 * param {string} cityName - 도시 이름
 * param {string} status - 날씨 상태(맑음, 비 등)
 */
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>도시 검색</h3>
      <!-- :value로 searchQuery 값을 입력창에 표시하고, @input으로 입력할 때마다 searchQuery를 갱신 (v-model을 풀어쓴 형태) -->
      <input type="text" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="검색할 도시 이름 입력" />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <section class="list-box">
      <h3>지역별 날씨 현황</h3>

      <!--
        v-for: weatherList 배열의 각 항목을 순회하며 카드를 반복 렌더링
        :key: Vue가 각 항목을 식별할 수 있도록 고유값(item.id) 지정 (성능/재사용 최적화에 필요)
        @click: 카드를 클릭하면 selectedCityInfo를 갱신
      -->
      <div v-for="item in weatherList" :key="item.id" class="weather-card" @click="selectedCityInfo = `${item.name}이 선택되었습니다.`">
        <!-- {{ }} 콧수염(mustache) 문법: 데이터를 텍스트로 그대로 출력 -->
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}°C</p>

        <!-- :class로 item.alert.class 값을 badge 클래스에 동적으로 추가 -->
        <span class="badge" :class="item.alert.class">{{ item.alert.label }}</span>

        <!-- @click.stop: 버튼 클릭 이벤트가 상위 div의 @click(카드 클릭)으로 전파되는 것을 막음 -->
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

/* 폭염경보: 최고 수준의 무더위 */
.badge.heat-warning {
  background: #d32f2f;
  color: #fff;
  font-weight: 700;
}

/* 폭염주의보 */
.badge.heat-caution {
  background: #ffb74d;
  color: #7a3d00;
  font-weight: 700;
}

/* 무더움 */
.badge.hot {
  background: #ffe0e0;
  color: #b71c1c;
}

/* 선선함 */
.badge.cool {
  background: #e0f0ff;
  color: #0d47a1;
}

/* 쌀쌀함 */
.badge.cold {
  background: #cfe4ff;
  color: #08306b;
}

/* 한파주의보 */
.badge.cold-caution {
  background: #6699ff;
  color: #fff;
  font-weight: 700;
}

/* 한파경보: 최고 수준의 한파 */
.badge.cold-warning {
  background: #1a3d8f;
  color: #fff;
  font-weight: 700;
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
