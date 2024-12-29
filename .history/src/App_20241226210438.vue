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

/* .hero {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--hero-background);
} */

.content {
  padding: 20px;
  background: #ffffff;
}

.footer {
  padding: 20px;
  text-align: center;
  background: #f0f0f0;
}
</style>
