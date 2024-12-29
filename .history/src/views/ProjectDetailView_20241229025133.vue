<template>
  <div class="project-detail">

    <!--프로젝트 기본 정보-->
    <!--프로젝트 이름-->
    <h2>{{ currentProject?.name }}</h2>

    <!--프로젝트 이미지-->
    <!-- <img :src="currentProject?.imageUrl" alt="Project Image" class="project-image" /> -->

    <!--프로젝트 데모 영상-->
    <p v-if="currentProject.demoVideo"><strong>{{ $t('project.demoVideo') }}:</strong>
      <youtube-video-player :youtubeUrl="currentProject.demoVideo">데모 영상 보기</youtube-video-player>
    </p>

    <!--프로젝트 설명-->
    <p>{{ currentProject?.description }}</p>

    <!--프로젝트 기술-->
    <div class="tech-stack">
      <span v-for="tech in currentProject.tools" :key="tech" class="tech">{{ tech }}</span>
    </div>

    <!--프로젝트 개발 기간-->
    <p><strong>{{ $t('project.devTime') }}:</strong> {{ currentProject.developmentPeriod }}</p>

    <!--프로젝트 참여 인원-->
    <p><strong>{{ $t('project.devPeole') }}:</strong> {{ currentProject.teamSize }}</p>

    <!--프로젝트 주된 역활-->
    <p><strong>{{ $t('project.mainPart') }}:</strong> {{ currentProject.role }}</p>

    <!-- 프로젝트 세부 설명 리스트 -->
    <ul>
      <li class="detail-list" v-for="(detail, index) in currentProject.details" :key="index">
        {{ detail }}
      </li>
    </ul>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/store/projectStore';
import YoutubeVideoPlayer from '../components/Project/YoutubeVideoPlayer.vue';

const projectStore = useProjectStore(); // Pinia 글로벌 스토어

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
  display: block;
  justify-content: center;
  width: 100%;
  height: 100%;
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

.tech-stack {
  margin-bottom: 1rem;
}

.tech {
  display: inline-block;
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  background: var(--link-hover-color);
  color: #fff;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
