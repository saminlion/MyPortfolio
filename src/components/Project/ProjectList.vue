<template>
  <section id="project-list">
    <div v-for="(project, index) in projects" :key="index" class="project-item">
      <Card style="width: 25rem; overflow: hidden; cursor: pointer;" @click="onCardClick(project)">
        <template #header>
          <!-- 프로젝트 이미지 -->
          <img :src="project.imageUrl" alt="Project image" class="project-image">
        </template>
        <template #title>
          <h3>{{ project.name }}</h3>
        </template>
        <template #content>
          <p> {{ project.description }} </p>
        </template>
      </Card>
    </div>    
    <project-detail v-if="visible" v-model:visible="visible" :project="selectedProject"></project-detail>
  </section>
</template>

<script>
import ProjectDetail from './ProjectDetail.vue';

export default {
  components: {
    ProjectDetail
  },

  data() {
    return {
      visible: false,
      selectedProject: null
    };
  },

  props: {
    projects: {
      type: JSON,
      required: true
    }
  },

  methods: {
    onCardClick(project) {
      this.selectedProject = project;
      this.visible = true;
    }
  },
};
</script>

<style scoped>
#project-list {
  display: flex;
  /* Flexbox 컨테이너로 설정 */
  flex-wrap: wrap;
  /* 화면이 작아지면 다음 줄로 이동 */
  gap: 1rem;
  /* 카드 사이 간격 */
  justify-content: space-between;
  /* 카드가 가운데 정렬되도록 설정 */
  margin: 1em 1;
}

.project-item {
  flex: 1 1 25rem;
  /* 최소 너비 25rem, 가로 공간을 균등하게 나눔 */
  max-width: 25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  padding: 1em;
  border-radius: 5px;
  margin-bottom: 2em;
}

.project-image {
  width: 100%;
  height: auto;
  max-width: 640px;
  margin: 1em 0;
}
</style>