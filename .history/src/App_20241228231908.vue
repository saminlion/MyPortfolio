<template>
  <div id="app">
    <!-- Hero Section (헤더 역할 포함) -->
    <HeroSection :currentProject="selectedProject" />

    <!-- Main Content -->
    <main class="content">
      <router-view @select-project="updateSelectedProject" />
    </main>
  </div>
</template>

<script setup>
import HeroSection from './views/HeroSection.vue';
import { ref } from 'vue';

// Hero 섹션에 넘길 현재 프로젝트
const selectedProject = ref(null);

function updateSelectedProject(project) {
  selectedProject.value = project;
}
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