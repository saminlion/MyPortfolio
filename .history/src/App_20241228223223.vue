<template>
  <div id="app">
    <!-- Hero Section (헤더 역할 포함) -->
    <HeroSection v-if="shouldShowHero" />

    <!-- Main Content -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import HeroSection from './views/HeroSection.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// 현재 라우트 정보 가져오기
const route = useRoute();

// HeroSection을 특정 라우트에서만 렌더링하도록 설정
const shouldShowHero = computed(() => {
  return route.name === 'home' || route.name === 'projects'; // HeroSection을 home과 projects에만 표시
});
</script>

<style scoped>
#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
}

.content {
  padding: 20px;
  background: var(--background-color);
}
</style>