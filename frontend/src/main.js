import { createApp } from 'vue'
import App from './App.vue'
import { auth, initAuth } from './auth'
import router from './router'
import './style.css'

async function bootstrap() {
  await initAuth()

  window.addEventListener('payops:unauthorized', () => {
    auth.user = null
    router.replace('/login')
  })

  createApp(App).use(router).mount('#app')
}

bootstrap()
