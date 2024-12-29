<template>
  <section class="project-view">
    <h2>{{ $t('project.title') }}</h2>
    <div class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
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
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// 프로젝트 데이터를 저장할 상태
const projects = ref([]);

// i18n locale 가져오기
const { locale } = useI18n();

// 언어별 JSON 파일 경로
const jsonFiles = {
  ko: '/project_ko.json',
  en: '/project_en.json',
  jp: '/project_jp.json',
};

// 언어 변경 시 데이터 다시 불러오기
async function loadProjects(lang) {
  try {
    const response = await fetch(jsonFiles[lang]);
    if (!response.ok) throw new Error(`Failed to load ${lang} projects`);
    const data = await response.json();
    projects.value = data;
  } catch (error) {
    console.error('Error loading project data:', error);
  }
}

// 초기 데이터 로드
onMounted(() => {
  loadProjects(locale.value);
});

// 언어 변경 감지
watch(locale, (newLocale) => {
  loadProjects(newLocale);
});

// 프로젝트 세부 정보 보기
function viewProject(id) {
  console.log(`Viewing project ${id}`);
}
</script>

<style scoped>
.project-view {
  padding: 2rem;
  background: var(--background-color);
  color: var(--text-color);
}

.project-view h2 {
  text-align: center;
  margin-bottom: 2rem;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-content {
  padding: 1rem;
}

.project-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.project-content p {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
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
  transition: background 0.3s ease, color 0.3s ease;
}

button:hover {
  background: var(--button-hover-background);
  color: var(--button-hover-text);
}
</style>
