import { defineStore } from 'pinia'

// 즐겨찾기 도시 목록 - 어느 컴포넌트에서든 props 없이 useFavoritesStore()로 바로 접근한다
const FAVORITES_KEY = 'weathertune-favorites'

const loadSavedFavorites = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: loadSavedFavorites(),
  }),

  getters: {
    count: (state) => state.ids.size,
    isFavorite: (state) => (cityId) => state.ids.has(cityId),
  },

  actions: {
    toggle(cityId) {
      if (this.ids.has(cityId)) this.ids.delete(cityId)
      else this.ids.add(cityId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...this.ids]))
    },
  },
})
