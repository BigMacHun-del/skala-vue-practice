import { defineStore } from 'pinia'

// 4번 요구사항(본인만의 추가 Store): 원래 WeatherMusicApp.vue 안에 로컬 상태(reactive Set + localStorage)로
// 있던 즐겨찾기 기능을 그대로 Pinia 스토어로 옮겼다. 로직은 동일하고, 이제 어느 컴포넌트에서든
// (예: 완전히 다른 라우트인 CityDetailView.vue) props를 안 거치고 바로 useFavoritesStore()로 접근할 수 있다.

const FAVORITES_KEY = 'weathertune-favorites'

const loadSavedFavorites = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export const useFavoritesStore = defineStore('favorites', {
  // state: Set을 그대로 넣어도 Pinia가 내부적으로 reactive()로 감싸주기 때문에,
  // WeatherMusicApp.vue에서 reactive(new Set())로 쓰던 것과 똑같이 add/delete가 반응형으로 감지된다.
  state: () => ({
    ids: loadSavedFavorites(),
  }),

  getters: {
    count: (state) => state.ids.size,
    // getters가 함수를 반환하게 하면 isFavorite(cityId)처럼 인자를 받는 형태로 쓸 수 있다.
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
