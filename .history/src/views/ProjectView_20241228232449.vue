<template>
  <section class="project-view">
    <div class="title-filter-bar">
      <h2>{{ $t('project.title') }}</h2>
      <div class="filters">
        <button
          v-for="tech in techStacks"
          :key="tech"
          :class="{ active: selectedFilter === tech }"
          @click="applyFilter(tech)"
        >
          {{ tech }}
        </button>
        <button
          :class="{ active: selectedFilter === 'all' }"
          @click="applyFilter('all')"
        >
          {{ $t('filters.all') }}
        </button>
      </div>
    </div>

    <div class="project-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <img :src="project.imageUrl" :alt="project.name" class="project-image" />
        <div class="project-content">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <div class="tech-stack">
            <span v-for="tech in project.tools" :key="tech" class="tech">{{ tech }}</span>
          </div>
          <button @click="viewProject(project.id)">{{ $t('project.viewDetails') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, emit } from 'vue';
import { useI18n } from 'vue-i18n';
import projectKo from '@/data/project_ko.json';
import projectEn from '@/data/project_en.json';
import projectJp from '@/data/project_jp.json';
import { useRouter } from 'vue-router';

// Vue Router 인스턴스 가져오기
const router = useRouter();

// 프로젝트 데이터를 저장할 상태
const projects = ref([]);
const selectedFilter = ref('all');

const techStacks = ['Unity', 'Unreal Engine', 'Live2D', 'VR', 'Metaverse'];

// i18n locale 가져오기
const { locale } = useI18n();

const jsonFiles = {
  ko: projectKo,
  en: projectEn,
  jp: projectJp,
};

// 현재 선택된 프로젝트
const selectedProject = ref(null);

// 필터링된 프로젝트 계산
const filteredProjects = computed(() =>
  selectedFilter.value === 'all'
    ? projects.value
    : projects.value.filter((project) =>
        project.tools.includes(selectedFilter.value)
      )
);

// 초기 데이터 로드
onMounted(() => {
  loadProjects(locale.value);
});

// 언어 변경 감지
watch(locale, (newLocale) => {
  loadProjects(newLocale);
});

// JSON 데이터 로드
function loadProjects(lang) {
  projects.value = jsonFiles[lang] || [];
}

// 필터 적용 로직
function applyFilter(filter) {
  selectedFilter.value = filter;
}

// 프로젝트 세부 정보 보기
function viewProject(id) {
  console.log(`Viewing project ${id}`);

  selectedProject.value = projects.value.find((project) => project.id === id);

  emit('select-project', selectedProject.value); // 부모 컴포넌트(App.vue)에 이벤트 전달

}
</script>

<style scoped>
.project-view {
  padding: 2rem;
  background: var(--background-color);
  color: var(--text-color);
}

.title-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title-filter-bar h2 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-color); /* 다크 모드 호환 */
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filters button {
  padding: 0.5rem 1rem;
  background: var(--button-background);
  color: var(--button-text);
  border: 1px solid var(--button-border);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, border 0.3s ease;
}

.filters button.active {
  background: var(--link-hover-color);
  color: #fff;
}

.filters button:hover {
  background: var(--button-hover-background);
  color: var(--button-hover-text);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--button-background);
  border: 1px solid var(--button-border);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-color: var(--link-hover-color);
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-content {
  padding: 1rem;
  background: var(--background-color); /* 다크 모드 호환 */
  color: var(--text-color); /* 다크 모드 호환 */
}

.project-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color); /* 다크 모드 호환 */
}

.project-content p {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-color); /* 다크 모드 호환 */
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

button {
  background: var(--button-background);
  color: var(--button-text);
  border: 1px solid var(--button-border);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, border 0.3s ease;
}

button:hover {
  background: var(--button-hover-background);
  color: var(--button-hover-text);
}

body {
  background: var(--background-color);
  color: var(--text-color);
}
</style>
