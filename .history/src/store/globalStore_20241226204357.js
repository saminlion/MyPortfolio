import { defineStore } from "pinia";
import { reactive } from "vue";

export const useGlobalStore = defineStore("global", {
    state: () =>
        reactive({
            language: 'ko',
            darkMode: 'true'
        }),
    actions: {
        setLanguage(language) {
            console.log("Previous language:", this.language);
            this.language = language;
            console.log("Updated language:", this.language);
        }
    }
});