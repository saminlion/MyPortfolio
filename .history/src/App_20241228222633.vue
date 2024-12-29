<template>
  <div id="app">
    <HeroSection>
    <router-view /> <!-- ProjectDetailView 콘텐츠가 삽입될 위치 -->
  </HeroSection>
  </div>
</template>

<script setup>
import HeroSection from './views/HeroSection.vue';


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