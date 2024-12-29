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
    <div class="hero-content detail-layout">

      <!-- Canvas with Dissolve Animation -->
      <div 
        v-show="!animationCompleted" 
        :class="{ dissolve: isDetailView }" 
        @animationend="onDissolveComplete"
        class="canvas-box"
      >

      </div>

      <!-- Project Detail View -->
      <div v-show="animationCompleted" class="project-detail-container">
        <ProjectDetailView />
      </div>
      
      
      <canvas ref="live2dCanvas" class="live2d-canvas"></canvas>
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


const live2dCanvas = ref(null);
const live2DLoader = ref(null);

const projectStore = useProjectStore(); // Pinia 글로벌 스토어
const globalStore = useGlobalStore(); // Pinia 글로벌 스토어

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
  home: { modelPath: '/Model/Wanko/', modelFileName: 'Wanko.model3.json', motionName: '00_idle', poseFileName: '', scale: 3, xPos: 0, yPos: 0,groupName: 'Idle', groupIndex: 0 },
  projects: { modelPath: '/Model/Rice/', modelFileName: 'Rice.model3.json', motionName: 'haru_g_m15', poseFileName: '', scale: 1.2, xPos: 0, yPos: 0,groupName: 'Idle', groupIndex: 0 },
  about: { modelPath: '/Model/tororo/', modelFileName: 'tororo.model3.json', motionName: '00_idle', poseFileName: 'tororo.pose3.json', scale: 2, xPos: 0, yPos: 0,groupName: 'Idle', groupIndex: 0 },
};

const currentPage = ref(route.name || 'home');
const currentText = ref(texts[currentPage.value]);
const currentModel = ref(models[currentPage.value] || models.home);

const currentProjectId = ref(projectStore.id);
const isDetailView = ref(false);
const animationCompleted = ref(false);

watch(
  () => route.name,
  (newPage) => {
    currentPage.value = newPage;

    currentText.value = texts[newPage] || texts.home;

    currentModel.value = models[newPage] || models.home;

    loadLive2DModel();
  }
);

watch(isDetailView, (newVal) => {
  if (newVal) {
    console.log("Dissolve effect triggered");
  }
});

watch(
  () => projectStore.id,
  (id) => {

    console.log(id);

    if (id != 0) {
      isDetailView.value = true;
    }

    else
    {
      isDetailView.value = false;
    }
  }
);

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

/* .hero-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem;
} */

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}


.detail-layout {
  flex-direction: row;
  justify-content: space-between;
}


.project-detail-container {
  flex: 1;
  margin-left: 2rem;
  padding: 1rem;
  border: 1px solid var(--button-border);
}

.canvas-box {
  position: relative;
  width: 600px;
  height: 600px;
  background-color: #000;
}

.dissolve {
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
  width: 600px;
  height: 600px;
  margin-top: 2rem;
  border-radius: 8px;
}
</style>
