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
    <ContactView class="footer" />
  </div>
</template>

<script setup>
// Script setup for App.vue
</script>

<style scoped>
#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
  color: #333;
}

.hero {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
}

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
