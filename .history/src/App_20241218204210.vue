<template>
  <div id="app" @mousemove="handleMouseMove">
    <HeaderView class="header" @navigate="handleNavigation" />

    <main class="content">
      <AboutView v-if="currentView === 'about'" />
      <ProjectView v-if="currentView === 'projects'" />
      <SkillsView v-if="currentView === 'skills'" />
      <!-- <ModelView v-if="currentView === 'model'"/> -->
    </main>

    <!-- <ModelView /> -->
    <canvas ref="live2dCanvas" class="live2d-canvas"></canvas>
    <ContactView class="footer" />
  </div>
</template>

<script>
import HeaderView from './views/HeaderView.vue'
import AboutView from './views/AboutView.vue';
import ProjectView from './views/ProjectView.vue';
import SkillsView from './views/SkillsView.vue';
import ContactView from './views/ContactView.vue';
import ModelView from './views/ModelView.vue';
import { Live2DLoader } from './utils/live2dLoader.js'
import { LAppModel } from './utils/LAppModel';

export default {
  components: {
    HeaderView,
    AboutView,
    ProjectView,
    SkillsView,
    ContactView,
    ModelView
  },

  data() {
    return {
      currentView: 'about',
      live2dLoader: null,
    };
  },

  methods: {
    handleNavigation(view) {
      this.currentView = view;
    },

    handleMouseMove(event) {
      const x = (event.clientX / window.innerWidth) * 2 - 1; // 정규화된 x 좌표
      const y = (event.clientY / window.innerHeight) * -2 + 1; // 정규화된 y 좌표
      this.live2DLoader.updateMousePosition(x, y); // 마우스 좌표 전달
    },
  },

  mounted() {
    // ref를 사용해 캔버스 엘리먼트 참조
    const canvas = this.$refs.live2dCanvas;
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    const dpr = window.devicePixelRatio || 1; //디스플레이 배율
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    //const modelPath = '/Model/Wanko/Wanko.model3.json';
    const modelPath = 'Wanko.model3.json';
    const modelDirectory = '/Model/Wanko/';

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    this.live2DLoader = new Live2DLoader(canvas, modelPath, modelDirectory);
    this.live2DLoader.loadLive2DModel();
    // this.live2DLoader = new LAppModel(gl);
    // this.live2DLoader.loadAssets(modelDirectory, modelPath);
  },
}
</script>

<style scooped>
/* 헤더를 화면 상단에 고정 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 1em;
  z-index: 1000;
  /* 다른 요소 위에 위치 */
}

/* 가운데 내용은 스크롤 가능 */
.content {
  flex: 1;
  /* 남은 공간을 채움 */
  margin-top: 60px;
  /* 헤더 높이만큼 여백 추가 */
  margin-bottom: 90px;
  /* 푸터 높이만큼 여백 추가 */
  overflow-y: auto;
  /* 스크롤 가능 */
  padding: 1em;
  min-height: calc(100vh - 150px);
}

/* 커스텀 스크롤바 */
.content {
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: #ccc #f9f9f9;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.live2d-canvas {
  position: absolute;
  bottom: 20px; /* Contact와 살짝 겹치도록 조정 */
  right: 0; /* 오른쪽 고정 */
  width: 300px;
  height: 400px;
  z-index: 999; /* 다른 요소 위에 위치 */
  background-color: rgba(0, 0, 0, 0); /* 투명 배경 */
}

/* 푸터를 화면 하단에 고정 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 5rem;
  text-align: center;
  z-index: 1000;
  /* 다른 요소 위에 위치 */
}
</style>