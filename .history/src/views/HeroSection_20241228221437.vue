<template>
  <section class="hero">
    <div class="hero-header">
      <nav class="nav-menu">
        <ul>
          <li>
            <router-link to="/" :class="{ active: currentPage === 'home' }">{{ $t('home.title') }}</router-link>
          </li>
          <li>
            <router-link to="/projects" :class="{ active: currentPage === 'projects' }">{{ $t('project.title')
              }}</router-link>
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
      <slot></slot> <!-- Project Detail -->
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LAppModel } from '../utils/LAppModel.js';
import projectData from '@/data/project_ko.json';

const live2dCanvas = ref(null);
const live2DLoader = ref(null);

const route = useRoute();
const { locale } = useI18n();

const languages = ['ko', 'en', 'jp'];
const isDark = ref(false);

// 페이지별 문구 및 Live2D 모델 설정
const texts = {
  home: { title: 'Welcome to My Portfolio', subtitle: 'Specializing in VTuber and VR' },
  projects: { title: 'Explore My Projects', subtitle: 'Filter and discover my work' },
  about: { title: 'About Me', subtitle: 'Learn more about my journey' },
};
const models = {
  home: { modelPath: '/Model/Wanko/', modelFileName: 'Wanko.model3.json', motionName: '00_idle', poseFileName: '', scale: 3, xPos: 0, yPos: 0 },
  projects: { modelPath: '/Model/Haru/', modelFileName: 'Haru.model3.json', motionName: 'haru_g_m15', poseFileName: 'Haru.pose3.json', scale: 1.2, xPos: 0, yPos: 0 },
  about: { modelPath: '/Model/tororo/', modelFileName: 'tororo.model3.json', motionName: '00_idle', poseFileName: 'tororo.pose3.json', scale: 2, xPos: 0, yPos: 0 },
};

const currentPage = ref(route.name || 'home');
const currentText = ref(texts[currentPage.value]);
const currentModel = ref(models[currentPage.value] || models.home);
const currentProject = ref(null); // 현재 디테일에 표시할 프로젝트


watch(
  () => route.name,
  (newPage) => {
    currentPage.value = newPage;

    console.log(`Current Page: ${newPage}, ID: ${route.params.id}`);

    // 만약 프로젝트 디테일 ID가 있다면 해당 데이터를 설정
    if (newPage === 'project-detail' && route.params.id) {
      const projectId = Number(route.params.id);
      currentProject.value = projectData.find((p) => p.id === projectId);

      console.log(`Current Project: ${currentProject.value}, ID: ${projectId}`);


    } else {
      currentProject.value = null; // 디테일 비우기
    }

    currentText.value = texts[newPage] || texts.home;
    currentModel.value = models[newPage] || models.home;

    loadLive2DModel();
  }
);

function loadLive2DModel() {
  if (!live2dCanvas.value) {
    console.error('Canvas element not found!');
    return;
  }

  const { modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos } = currentModel.value;

  const canvas = live2dCanvas.value;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  try {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL context not available!');

    live2DLoader.value = new LAppModel(canvas, modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos);
    live2DLoader.value.initialize();

    // live2DLoader.value.startIdleAnimation();
  } catch (error) {
    console.error('Error loading Live2D model:', error.message);
  }
}

function translate(index) {
  const selectedLanguage = languages[index];
  locale.value = selectedLanguage;
  console.log(`Language changed to: ${selectedLanguage}`);
}

function toggleDarkMode() {
  const htmlElement = document.documentElement;
  isDark.value = !isDark.value;
  if (isDark.value) {
    htmlElement.classList.add('dark-mode');
  } else {
    htmlElement.classList.remove('dark-mode');
  }
  localStorage.setItem('darkMode', isDark.value);
}

onMounted(() => {
  loadLive2DModel();
  const storedTheme = localStorage.getItem('darkMode');
  if (storedTheme === 'true') {
    isDark.value = true;
    document.documentElement.classList.add('dark-mode');
  }
});
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
  text-align: center;
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

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem;
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
  font-size: 1rem;
}

.nav-menu ul li a.active {
  font-weight: bold;
  color: var(--link-hover-color);
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switcher button {
  padding: 5px 10px;
  background: var(--button-background);
  border: 1px solid var(--button-border);
  border-radius: 5px;
  color: var(--button-text);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.language-switcher button:hover {
  background: var(--button-hover-background);
  color: var(--button-hover-text);
}

.theme-toggle button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.detail-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background-color);
  color: var(--text-color);
  padding: 1rem;
  width: 60%;
}

.detail-image {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.detail-section ul {
  list-style: none;
  padding: 0;
}

.detail-section li {
  display: inline-block;
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--link-hover-color);
  color: #fff;
  border-radius: 4px;
}

.live2d-canvas {
  width: 600px;
  height: 600px;
  margin-top: 2rem;
}
</style>
