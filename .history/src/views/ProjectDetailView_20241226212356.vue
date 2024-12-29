<template>
    <section class="project-detail">
      <h2>{{ project?.title }}</h2>
      <img :src="project?.image" :alt="project?.title" class="project-image" />
      <p>{{ project?.description }}</p>
      <div class="tech-stack">
        <h3>Technologies:</h3>
        <ul>
          <li v-for="tech in project?.techStack" :key="tech">{{ tech }}</li>
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
  
  // 샘플 프로젝트 데이터
  const projects = [
    {
      id: 1,
      title: 'VR Game',
      description: 'An immersive VR game built with Unity.',
      image: '/images/vr-game.jpg',
      techStack: ['Unity', 'C#', 'VR'],
    },
    {
      id: 2,
      title: 'Metaverse Platform',
      description: 'A social platform for virtual worlds.',
      image: '/images/metaverse.jpg',
      techStack: ['Unreal Engine', 'Blueprints', '3D Modeling'],
    },
    {
      id: 3,
      title: 'VTuber System',
      description: 'A Live2D VTuber streaming system.',
      image: '/images/vtuber.jpg',
      techStack: ['Live2D', 'OBS', 'Python'],
    },
  ];
  
  // 현재 라우트에서 ID 가져오기
  const route = useRoute();
  const project = ref(null);
  
  onMounted(() => {
    const projectId = Number(route.params.id);
    project.value = projects.find((p) => p.id === projectId);
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
  