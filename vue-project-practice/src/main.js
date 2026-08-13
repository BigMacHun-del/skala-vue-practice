import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primevue/themes/aura'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// PrimeVue: 지금은 공유 카드 섹션(ShareCardSection.vue)의 "이미지로 저장" 버튼에만 적용했다.
// Aura 테마 기본 프리셋을 쓰되, 그 버튼 자체는 scoped CSS로 이 앱의 그라디언트/필 스타일에 맞게 덮어썼다.
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.theme-dark',
    },
  },
})
// ShareCardSection.vue에서 "저장 완료" 토스트 알림을 띄우는 데 씀 (useToast()가 이 서비스 등록을 전제로 함)
app.use(ToastService)

app.mount('#app')
