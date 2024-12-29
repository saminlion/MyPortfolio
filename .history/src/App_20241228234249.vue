<template>
  <div id="app">
    <!-- Hero Section (헤더 역할 포함) -->
    <HeroSection   v-if="currentPage === 'home' || currentPage === 'projects' || isDetailView"
  :currentProject="selectedProject" 
  :isDetailView="isDetailView" 
/>


    <!-- Main Content -->
    <main class="content">
      <router-view @select-project="updateSelectedProject" />
    </main>
  </div>
</template>

<script setup>
import HeroSection from './views/HeroSection.vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentPage = ref(route.name);

watch(
  () => route.name,
  (newPage) => {
    currentPage.value = newPage;
  }
);

// Hero 섹션에 넘길 현재 프로젝트
const selectedProject = ref(null);

const isDetailView = ref(false);

function updateSelectedProject(project) {

  console.log('Project', project);

  if (project) {
    selectedProject.value = project;
    console.log('Project', selectedProject.value);
    isDetailView.value = true;
  } else {
    selectedProject.value = null;
    isDetailView.value = false;
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