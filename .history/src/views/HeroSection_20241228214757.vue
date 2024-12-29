<template>
  <section class="hero">
    <div class="hero-header">
      <nav class="nav-menu">
        <ul>
          <li>
            <router-link to="/" :class="{ active: currentPage === 'home' }">{{ $t('home.title') }}</router-link>
          </li>
          <li>
            <router-link to="/projects" :class="{ active: currentPage === 'projects' }">{{ $t('project.title') }}</router-link>
          </li>
          <li>
            <router-link to="/about" :class="{ active: currentPage === 'about' }">{{ $t('about.title') }}</router-link>
          </li>
        </ul>
      </nav>
      <div class="controls">
        <div class="language-switcher">
          <button @click="translate(0)">한국어</button>
          <button @click="translate(1)">English</button>
          <button @click="translate(2)">日本語</button>
        </div>
        <div class="theme-toggle">
          <button v-if="!isDark" @click="toggleDarkMode()">🌞</button>
          <button v-if="isDark" @click="toggleDarkMode()">🌜</button>
        </div>
      </div>
    </div>

    <div class="hero-content">
      <canvas ref="live2dCanvas" class="live2d-canvas"></canvas>
      <transition name="fade">
        <div class="project-detail" v-if="currentProject">
          <h2>{{ currentProject.name }}</h2>
          <img :src="currentProject.imageUrl" :alt="currentProject.name" class="project-image" />
          <p>{{ currentProject.description }}</p>
          <div class="tech-stack" v-if="currentProject.tools?.length">
            <h3>Technologies:</h3>
            <ul>
              <li v-for="tech in currentProject.tools" :key="tech">{{ tech }}</li>
            </ul>
          </div>
          <button @click="clearProject">Back to Projects</button>
        </div>
      </transition>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LAppModel } from '../utils/LAppModel.js';
import projectData from '@/data/project_ko.json';

const live2dCanvas = ref(null);
const live2DLoader = ref(null);
const currentProject = ref(null); // 현재 표시할 프로젝트
const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const isDark = ref(false);
const languages = ['ko', 'en', 'jp'];

// 페이지 변경 시 프로젝트 정보 설정
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentProject.value = projectData.find((p) => p.id === Number(newId));
      triggerCharacterAnimation(); // 애니메이션 실행
    } else {
      currentProject.value = null;
    }
  }
);

// Live2D 모델 초기화
function loadLive2DModel() {
  const canvas = live2dCanvas.value;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  try {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL context not available!');

    live2DLoader.value = new LAppModel(canvas, '/Model/Haru/', 'Haru.model3.json', '00_idle', '', 2, 0, 0);
    live2DLoader.value.initialize();
  } catch (error) {
    console.error('Error loading Live2D model:', error.message);
  }
}

// 캐릭터 애니메이션 트리거
function triggerCharacterAnimation() {
  // Live2D 캐릭터 애니메이션 구현 (예: 모션 변경)
  console.log('Character animation triggered for project detail.');
}

// 테마 토글
function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark-mode', isDark.value);
}

// 언어 변경
function translate(index) {
  locale.value = languages[index];
}

// 프로젝트 화면으로 돌아가기
function clearProject() {
  router.push('/projects');
}
</script>

<style scoped>
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: var(--hero-background);
  color: var(--text-color);
  padding: 1rem;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: var(--header-background);
}

.nav-menu ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu ul li a {
  text-decoration: none;
  color: var(--link-color);
}

.nav-menu ul li a.active {
  font-weight: bold;
  color: var(--link-hover-color);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.live2d-canvas {
  width: 400px;
  height: 600px;
}

.project-detail {
  flex: 1;
  padding: 2rem;
  background: var(--background-color);
  border-radius: 8px;
  color: var(--text-color);
  margin-left: 1rem;
}

.project-image {
  width: 100%;
  border-radius: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
