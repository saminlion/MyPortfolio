import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Primevue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import i18n from './i18n';
//#region Primevue Component Import
import Accordion from 'primevue/accordion';
import AccordionPanel  from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import MeterGroup from 'primevue/metergroup';
//#endregion

import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()


app.use(Primevue, {
theme: {
    preset:Aura,
    options: {
        darkModeSelector: '.my-app-dark',
    }
}
})

app.use(router)
app.use(pinia)
app.use(i18n)

app.component('Accordion', Accordion)
app.component('AccordionPanel', AccordionPanel)
app.component('AccordionHeader', AccordionHeader)
app.component('AccordionContent', AccordionContent)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('Button', Button)
app.component('Divider', Divider)
app.component('MeterGroup', MeterGroup)

app.mount('#app')
