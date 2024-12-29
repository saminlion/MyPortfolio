<template>
  <div id="app">
    <!-- Hero Section (헤더 역할 포함) -->
    <HeroSection :currentProject="selectedProject" :isDetailView="isDetailView" />

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

let isDetailView = false;

function updateSelectedProject(project) {

  if (selectedProject.value) {
    selectedProject.value = project;

    isDetailView = true;
  }

  else {
    selectedProject.value = null;
    isDetailView = false;
  }
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