import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vue-toast-notification/dist/theme-default.css';
import createToast from 'vue-toast-notification'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.config.devtools = true;

app.use(createPinia())
app.use(router)
app.use(createToast, {
    position: 'top-right'
})

app.mount('#app')
