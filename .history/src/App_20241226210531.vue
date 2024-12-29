<template>
  <div id="app">
    <!-- Main Application Layout -->

    <!-- Hero Section -->
    <HeroSection class="hero" />

    <!-- Main Content -->
    <main class="content">
      <router-view />
    </main>

    <!-- Footer Section -->
    <!-- <ContactView class="footer" /> -->
  </div>
</template>

<script setup>
import HeroSection from './views/HeroSection.vue';

// Script setup for App.vue
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

.footer {
  padding: 20px;
  text-align: center;
  background: var(--background-color);
}
</style>
