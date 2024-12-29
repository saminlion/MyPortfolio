<template>
  <div class="project-detail">
    <h2>{{ currentProject?.name }}</h2>
    <img :src="currentProject?.imageUrl" alt="Project Image" class="project-image" />
    <p>{{ currentProject?.description }}</p>
    <ul v-if="currentProject?.tools?.length">
      <li v-for="tool in currentProject.tools" :key="tool">{{ tool }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import projectData from '@/data/project_ko.json'; // JSON 데이터 가져오기
import { useProjectStore } from '@/store/projectStore';

const projectStore = useProjectStore(); // Pinia 글로벌 스토어

const route = useRoute();
const project = ref(null);

const currentProject = ref(projectStore.project);
const currentProjectId = ref(projectStore.id);

watch(
  () => projectStore.id,
  (id) => {

    console.log(id);

    if (id != 0) {
      currentProjectId.value = id;
      currentProject.value = projectStore.project;
    }
  }
);

onMounted(() => {
});
</script>

<style scoped>
.project-detail {
  padding: 2rem;
  background: var(--background-color);
  color: var(--text-color);
  width: auto;
  height: auto;
}

.project-detail h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.project-detail .project-image {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.tech-stack ul {
  list-style: none;
  padding: 0;
}

.tech-stack ul li {
  display: inline-block;
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  background: var(--link-hover-color);
  color: #fff;
  border-radius: 4px;
}
</style>
