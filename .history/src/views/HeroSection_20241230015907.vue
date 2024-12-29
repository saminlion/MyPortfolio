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
    <div class="hero-content detail-layout" v-if="isAbout">

      <!-- Canvas with Dissolve Animation -->
      <div v-show="!animationCompleted" :class="{ dissolve: isDetailView }" @animationend="onDissolveComplete"
        class="canvas-box">
      </div>

      <!-- Project Detail View -->
      <div v-show="animationCompleted" v-if="isProject" class="project-detail-container">
        <ProjectDetailView />
      </div>

      <div v-show="isHome" class="home-info">
        <HomeInfo />
      </div>

      <canvas ref="live2dCanvas" class="live2d-canvas" @click="Live2DClick"></canvas>

    </div>


  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LAppModel } from '../utils/LAppModel.js';
import { useGlobalStore } from '@/store/globalStore';
import ProjectDetailView from './ProjectDetailView.vue';
import { useProjectStore } from '@/store/projectStore';
import HomeInfo from '@/components/Home/HomeInfo.vue';

const live2dCanvas = ref(null);
const live2DLoader = ref(null);

const projectStore = useProjectStore(); // Pinia 글로벌 스토어
const globalStore = useGlobalStore(); // Pinia 글로벌 스토어

const route = useRoute();
const { locale } = useI18n();

const languages = ['ko', 'en', 'jp'];
const isDark = ref(false);
const isProject = ref(false);
const isAbout = ref(false);

// 페이지별 문구 및 Live2D 모델 설정
const texts = {
  home: { title: 'Welcome to My Portfolio', subtitle: 'Specializing in VTuber and VR' },
  projects: { title: 'Explore My Projects', subtitle: 'Filter and discover my work' },
  about: { title: 'About Me', subtitle: 'Learn more about my journey' },
};
const models = {
  home: { modelPath: '/Model/Wanko/', modelFileName: 'Wanko.model3.json', motionName: '00_idle', poseFileName: '', scale: 2.5, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
  projects: { modelPath: '/Model/Rice/', modelFileName: 'Rice.model3.json', motionName: 'haru_g_m15', poseFileName: '', scale: 1.5, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
  about: { modelPath: '/Model/tororo/', modelFileName: 'tororo.model3.json', motionName: '00_idle', poseFileName: 'tororo.pose3.json', scale: 1.6, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
};//FlickRight

const currentPage = ref(route.name || 'home');
const currentText = ref(texts[currentPage.value]);
const currentModel = ref(models[currentPage.value] || models.home);

const isDetailView = ref(false);
const animationCompleted = ref(false);
const isHome = ref(true);

watch(
  () => route.name,
  (newPage) => {
    currentPage.value = newPage;

    currentText.value = texts[newPage] || texts.home;

    currentModel.value = models[newPage] || models.home;

    const canvasBox = document.querySelector('.canvas-box');

    if (currentPage.value === 'projects') {
      animationCompleted.value = false; // 상태 초기화
      isProject.value = true;
      isHome.value = false;
      isAbout.value = false;
    }

    else if (currentPage.value === 'home') {
      animationCompleted.value = true; // 상태 초기화
      isProject.value = false;
      projectStore.id = 0;
      isHome.value = true;
      isAbout.value = false;
    }
    else {
      animationCompleted.value = true; // 상태 초기화
      isProject.value = false;
      projectStore.id = 0;
      isHome.value = false;
      isAbout.value = true;
    }
    console.log('currentPage.value', currentPage.value, isProject.value, isHome.value);

    loadLive2DModel();
  }
);

watch(isDetailView, (newVal) => {

  if (newVal) {
    console.log("Dissolve effect triggered");

    live2DLoader.value.CustomMotion('TapBody', 0, 2, false, () => {
      console.log('Dissolve animation starting...');

      // 여기에 dissolve 애니메이션 로직 추가
      triggerDissolveAnimation();
    });
  }
});

watch(
  () => projectStore.id,
  (id) => {

    console.log(id);

    if (id != 0) {
      isDetailView.value = true;
    }

    else {
      isDetailView.value = false;
    }
  }
);

function Live2DClick() {
  if (currentPage.value !== 'projects') {
    live2DLoader.value.CustomMotion('Tap', 0, 2, true);
  }
}

function triggerDissolveAnimation() {
  const canvas = document.querySelector('.canvas-box');

  if (!canvas) {
    console.error('Canvas not found for dissolve animation');
    return;
  }

  // 예: CSS 애니메이션 클래스 추가
  canvas.classList.add('dissolve-effect');

  // 애니메이션 종료 후 처리
  canvas.addEventListener('animationend', () => {
    console.log('Dissolve animation completed');
    canvas.classList.remove('dissolve-effect');
  }, { once: true });
}

function onDissolveComplete() {
  animationCompleted.value = true;
}

function loadLive2DModel() {
  if (!live2dCanvas.value) {
    console.error('Canvas element not found!');
    return;
  }

  const { modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos, groupName, groupIndex } = currentModel.value;
  // currentPage.value === 'project-detail' ? models.projects : models[currentPage.value] || models.home;

  const canvas = live2dCanvas.value;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  try {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL context not available!');

    live2DLoader.value = new LAppModel(canvas, modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos, groupName, groupIndex);
    live2DLoader.value.initialize();

    // live2DLoader.value.startIdleAnimation();
  } catch (error) {
    console.error('Error loading Live2D model:', error.message);
  }
}

function translate(index) {
  const selectedLanguage = languages[index];
  locale.value = selectedLanguage;
  globalStore.setLanguage(selectedLanguage); // Pinia 업데이트
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


  if (currentPage.value === 'home') {
    animationCompleted.value = true; // 상태 초기화
    isProject.value = false;
    projectStore.id = 0;
    isHome.value = true;
  }
});
</script>

<style scoped>
.hero {
  /* 부모 요소 */
  position: relative;
  height: 150vh;
  /* 항상 화면 높이에 맞춤 */
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

/* .hero-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem;
}  */

.hero-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 90vw;
  /* 화면 너비의 90%로 설정 */
  max-width: 1500px;
  /* 최대 너비 제한 */
  height: 90vh;
  /* 높이를 유지 */
  padding: 1rem;
  margin: 0 auto;
  /* 화면 중앙 정렬 */
}


.detail-layout {
  position: relative;
  /* 부모 요소 */
  flex-direction: row;
  justify-content: space-between;
}


.project-detail-container {
  flex: 2;
  /* 프로젝트 상세 영역에 일정 비율 할당 */
  max-width: 50%;
  left: 0%;
  /* 전체 화면의 절반 너비로 제한 */
  margin-right: 2rem;
  background: var(--button-background);
  border: 1px solid var(--button-border);
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  height: auto;
  /* 긴 내용은 스크롤 가능 */
}

.canvas-box {
  display: block;
  /* 보이지 않을 경우를 대비 */
  flex: 1;
  max-width: 50%;
  height: 600px;
  background-color: #000;
  border-radius: 8px;
}

.dissolve-effect {
  animation: dissolveEffect 1.5s forwards;
}

@keyframes dissolveEffect {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: scale(1.1);
  }
}

.live2d-canvas {
  position: absolute;
  /* 캔버스를 고정 위치에 배치 */
  top: 50%;
  /* 화면의 세로 중앙 정렬 */
  right: 0%;
  /* 오른쪽에 위치 */
  transform: translateY(-50%);
  /* 세로 중앙 보정 */
  width: 800px;
  /* 고정된 너비 */
  height: 800px;
  /* 고정된 높이 */
  border-radius: 8px;
  z-index: 9999;
  /* 최상위로 설정 */
}
</style>