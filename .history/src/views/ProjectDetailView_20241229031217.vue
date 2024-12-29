<template>
  <div class="project-detail">
    <!-- Tabs -->
    <div class="tabs">
      <button v-for="(tab, index) in tabs" :key="index" :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="tab-content" v-if="activeTab === 'basic'">
      <!--프로젝트 기본 정보-->

      <!--프로젝트 이미지-->
      <img :src="currentProject?.imageUrl" alt="Project Image" class="project-image" />

      <!--프로젝트 이름-->
      <h2>{{ currentProject?.name }}</h2>

      <!--프로젝트 설명-->
      <p>{{ currentProject?.description }}</p>

      <!--프로젝트 기술-->
      <div class="tech-stack">
        <span v-for="tech in currentProject?.tools" :key="tech" class="tech">{{ tech }}</span>
      </div>

      <!--프로젝트 개발 기간-->
      <p><strong>{{ $t('project.devTime') }}:</strong> {{ currentProject?.developmentPeriod }}</p>

      <!--프로젝트 참여 인원-->
      <p><strong>{{ $t('project.devPeole') }}:</strong> {{ currentProject?.teamSize }}</p>

    </div>
    <div class="tab-content" v-if="activeTab === 'demo' && currentProject?.demoVideo">
      <!--프로젝트 데모 영상-->
      <p v-if="currentProject?.demoVideo"><strong>{{ $t('project.demoVideo') }}:</strong>
        <youtube-video-player :youtubeUrl="currentProject.demoVideo">데모 영상 보기</youtube-video-player>
      </p>
    </div>
    <div class="tab-content" v-if="activeTab === 'role'">
      <!--프로젝트 주된 역활-->
      <p><strong>{{ $t('project.mainPart') }}:</strong> {{ currentProject?.role }}</p>

      <!-- 프로젝트 세부 설명 리스트 -->
      <ul>
        <li class="detail-list" v-for="(detail, index) in currentProject?.details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>

    <div class="tab-content" v-if="activeTab === 'achive'">
      <!-- 프로젝트 성과 리스트 -->
      <ul>
        <li class="detail-list" v-for="(detail, index) in currentProject?.details" :key="index">
          {{ detail }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/store/projectStore';
import YoutubeVideoPlayer from '../components/Project/YoutubeVideoPlayer.vue';

const projectStore = useProjectStore(); // Pinia 글로벌 스토어

const currentProject = ref(projectStore.project);
const currentProjectId = ref(projectStore.id);

const activeTab = ref('basic'); // 기본 정보 탭 활성화

const tabs = [
  { id: 'basic', label: '기본 정보' },
  { id: 'demo', label: '데모' },
  { id: 'role', label: '역활' },
  { id: 'achive', label: '성과' },
];

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
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
@media (max-width: 768px) {

.tabs {
  flex-direction: column;
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--button-border);
}


.tab-content {
  display: flex;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--button-background);
}
}

.tabs button {
  flex: 1;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 1rem;
  color: var(--text-color);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button:hover {
  background: rgba(0, 0, 0, 0.05);
}


.tabs button.active {
  font-weight: bold;
  color: var(--link-hover-color);
  border-bottom: 2px solid var(--link-hover-color);
}
.achievement-list {
  margin: 0.5rem 0;
}
</style>
