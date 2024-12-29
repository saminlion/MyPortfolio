<template>
  <div id="app">
    <!-- Hero Section (헤더 역할 포함) -->
    <HeroSection class="hero" />

    <!-- Main Content -->
    <main class="content">
      <router-view />
    </main>
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