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
      isIdle: false, // 사용자 상태 (idle인지 여부)
      idleTimer: null, // idle 상태 타이머
      idleTimeout: 5000, // 5초 동안 입력 없으면 idle 상태로 전환
    };
  },

  methods: {
    handleNavigation(view) {
      this.currentView = view;
    },

    handleMouseMove(event) {
      const x = (event.clientX / window.innerWidth) * 2 - 1; // 정규화된 x 좌표
      const y = (event.clientY / window.innerHeight) * -2 + 1; // 정규화된 y 좌표

      // 사용자 입력을 active로 설정
      this.isIdle = false;

      // 마우스 좌표 업데이트
      this.live2DLoader.updateMousePosition(x, y);

      // 기존 타이머를 지우고 새로 설정
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.enterIdleState();
      }, this.idleTimeout);
    },

    enterIdleState() {
      this.isIdle = true; // idle 상태로 전환
      this.live2DLoader.startIdleAnimation(); // Idle 애니메이션 실행
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

    // const modelPath = '/Model/Wanko/';
    // const modelFileName = 'Wanko.model3.json';
    // const motionPath = '/Model/Wanko/motions/';
    // const motionName = 'idle_03';  

    const modelPath = '/Model/tororo/';
    const modelFileName = 'tororo.model3.json';
    const motionPath = '/Model/tororo/motion/';
    const motionName = '00_idle';
    const modelDirectory = '/Model/tororo/';

    //   const modelPath = '/Model/hijiki/';
    //  const modelFileName = 'hijiki.model3.json';
    //  const motionPath = '/Model/hijiki/motion/';
    //  const motionName = '00_idle';
    //   const modelDirectory = '/Model/hijiki/';

    //     const modelPath = '/Model/mark/';
    // const modelFileName = 'mark_free_t04.model3.json';
    // const motionPath = '/Model/mark/motion/';
    // const motionName = 'mark_m01';

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    // this.live2DLoader = new Live2DLoader(canvas, modelPath, modelDirectory, motionPath, motionName);
    // this.live2DLoader.loadLive2DModel();
    this.live2DLoader = new LAppModel(canvas, modelPath, modelFileName, motionPath, motionName);
    this.live2DLoader.loadAssets();

    // 사용자 입력 감지 이벤트
    window.addEventListener('mousemove', this.handleMouseMove);
    // 일정 시간 후 idle 상태로 전환
    this.idleTimer = setTimeout(() => {
      this.enterIdleState();
    }, this.idleTimeout);
  },

  beforeDestroy() {
    // 이벤트 및 타이머 정리
    window.removeEventListener('mousemove', this.handleMouseMove);
    clearTimeout(this.idleTimer);
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
  bottom: 20px;
  /* Contact와 살짝 겹치도록 조정 */
  right: 0;
  /* 오른쪽 고정 */
  width: 300px;
  height: 400px;
  z-index: 999;
  /* 다른 요소 위에 위치 */
  background-color: rgba(0, 0, 0, 0);
  /* 투명 배경 */
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