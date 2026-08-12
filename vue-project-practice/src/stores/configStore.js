import { defineStore } from 'pinia'

// Pinia에는 두 가지 스타일이 있는데, stores/counter.js(스캐폴딩 기본 파일)는 Composition API 스타일이고
// 여긴 과제에서 요구한 state/getters/actions 용어에 맞춰 Options API 스타일로 작성한다.
// (defineStore의 두 번째 인자가 함수면 Composition 스타일, 객체면 Options 스타일)

const CONFIG_KEY = 'weathertune-config'

// localStorage에 저장해둔 단위가 있으면 그 값을, 없으면 기본값 'celsius'를 반환
const loadSavedUnit = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '{}')
    return saved.unit === 'fahrenheit' ? 'fahrenheit' : 'celsius'
  } catch {
    return 'celsius'
  }
}

export const useConfigStore = defineStore('config', {
  // state: 이 스토어가 들고 있는 반응형 데이터. 함수로 감싸서 반환해야 스토어 인스턴스마다 독립된 상태를 가진다.
  state: () => ({
    unit: loadSavedUnit(), // 'celsius' | 'fahrenheit'
  }),

  // getters: computed처럼 state로부터 파생되는 읽기 전용 값. state가 바뀔 때만 다시 계산된다.
  getters: {
    unitSymbol: (state) => (state.unit === 'fahrenheit' ? '°F' : '°C'),
  },

  // actions: state를 실제로 변경하는 함수. 컴포넌트에서 configStore.toggleUnit()처럼 바로 호출한다.
  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ unit: this.unit }))
    },
  },
})
