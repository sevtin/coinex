// import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElTableInfiniteScroll from "el-table-infinite-scroll";
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia)

app.use(ElTableInfiniteScroll);

app.use(router)

app.mount('#app')
