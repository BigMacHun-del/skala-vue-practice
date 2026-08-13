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
// PrimeVue: ShareCardSection.vue의 저장 버튼/토스트 알림에 적용 (Aura 테마 + scoped CSS로 커스텀)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.theme-dark',
    },
  },
})
app.use(ToastService)

app.mount('#app')
