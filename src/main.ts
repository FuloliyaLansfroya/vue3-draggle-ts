import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import GridLayout from 'vue3-drr-grid-layout';
import 'vue3-drr-grid-layout/dist/style.css';
createApp(App).use(GridLayout).mount('#app');
