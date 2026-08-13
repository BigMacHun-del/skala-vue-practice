import { defineStore } from 'pinia'

const CONFIG_KEY = 'weathertune-config'

const loadSavedUnit = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '{}')
    return saved.unit === 'fahrenheit' ? 'fahrenheit' : 'celsius'
  } catch {
    return 'celsius'
  }
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: loadSavedUnit(), // 'celsius' | 'fahrenheit'
  }),

  getters: {
    unitSymbol: (state) => (state.unit === 'fahrenheit' ? '°F' : '°C'),
  },

  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ unit: this.unit }))
    },
  },
})
