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

      <!--프로젝트 이름-->
      <h2>{{ currentProject?.name }}</h2>

      <!--프로젝트 이미지-->
      <img :src="currentProject?.imageUrl" alt="Project Image" class="project-image" />

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
      <div class="youtube-wrapper">
        <youtube-video-player :youtubeUrl="currentProject.demoVideo">데모 영상 보기</youtube-video-player>
        </div>
    </div>

    <!--프로젝트 주된 역활-->
    <div class="tab-content" v-if="activeTab === 'role'">

      <!-- 프로젝트 세부 설명 카드 -->
      <div class="role-cards">
        <div v-for="(detail, index) in currentProject?.details" :key="index" class="role-card">
          <div class="role-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="role-content">
            <p>{{ detail }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content" v-if="activeTab === 'achive'">
      <!-- 프로젝트 성과 리스트 -->
      <div class="role-cards">
        <div v-for="(detail, index) in currentProject?.details" :key="index" class="role-card">
          <div class="role-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="role-content">
            <p>{{ detail }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useProjectStore } from '@/store/projectStore';
import YoutubeVideoPlayer from '../components/Project/YoutubeVideoPlayer.vue';
import { useI18n } from 'vue-i18n';

// i18n locale 가져오기
const { t } = useI18n();

const projectStore = useProjectStore(); // Pinia 글로벌 스토어

const currentProject = ref(projectStore.project);
const currentProjectId = ref(projectStore.id);

const activeTab = ref('basic'); // 기본 정보 탭 활성화

const tabs = ref([]);

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
  tabs.value = [
    { id: 'basic', label: t('project.basicInfo') },
    { id: 'demo', label: t('project.demoVideo') },
    { id: 'role', label: t('project.mainPart') },
    { id: 'achive', label: t('project.achieve') },
  ];
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
  border-radius: 8px;

  width: 100%; /* 부모 크기에 맞게 조정 */
  height: 200px; /* 고정된 높이 */
  object-fit: cover; /* 이미지 비율 유지 */
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

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--button-border);
  height: 50px; /* 고정된 높이 */
}


.tab-content {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--button-background);
  max-height: 500px; /* 고정된 최대 높이 설정 */
  overflow-y: auto; /* 스크롤 가능 */
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

.role-cards {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* 두 개의 열로 고정 */
  gap: 1rem;
  margin-top: 1rem;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: var(--button-background);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.role-icon {
  margin-right: 1rem;
  font-size: 1.5rem;
  color: var(--link-hover-color);
}

.role-content p {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.6rem;
  color: var(--text-color);
}

.youtube-wrapper {
  display: block;
  width: 100%; /* 부모 크기에 따라 반응형으로 설정 */
  max-width: 800px; /* 최대 너비 */
  height: 450px; /* 고정된 높이 */
  margin: 0 auto; /* 중앙 정렬 */
  background: #000; /* 배경색 지정 (옵션) */
  overflow: hidden; /* 콘텐츠 넘침 방지 */
  border-radius: 8px; /* 선택적 둥근 모서리 */
}

.youtube-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.achievement-list {
  margin: 0.5rem 0;
}
</style>
