<template>
  <section class="project-detail">
    <h2>{{ project?.title }}</h2>
    <img :src="project?.imageUrl" :alt="project?.title" class="project-image" />
    <p>{{ project?.description }}</p>

    <div class="tech-stack" v-if="project?.tools?.length">
      <h3>Technologies:</h3>
      <ul>
        <li v-for="tech in project.tools" :key="tech">{{ tech }}</li>
      </ul>
    </div>

    <router-link to="/projects">
      <button>Back to Projects</button>
    </router-link>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import projectData from '@/data/project_ko.json'; // JSON 데이터 가져오기

const route = useRoute();
const project = ref(null);

onMounted(() => {
  const projectId = route.params.id;
  project.value = projectData.find((p) => p.id === projectId);
});
</script>

<style scoped>
.project-detail {
  padding: 2rem;
  background: var(--background-color);
  color: var(--text-color);
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
