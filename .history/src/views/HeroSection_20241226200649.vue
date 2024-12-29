<template>
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to My Portfolio</h1>
        <p>Specializing in VTuber, VR, and Metaverse Programming</p>
        <a href="#projects" class="button">Explore My Work</a>
      </div>
      <canvas ref="live2dCanvas" class="live2d-canvas"></canvas>
    </section>
  </template>

<script setup>
// Live2D 초기화 로직
import { onMounted, ref } from 'vue';
import { LAppModel } from './utils/LAppModel';

const live2dCanvas = ref(null);

onMounted(() => {
  // Live2D 모델 초기화 코드 예시
  if (live2dCanvas.value) {
    const modelPath = '/Model/Wanko/';

    loadLive2DModel(live2dCanvas.value, modelPath);
  }
});

function loadLive2DModel(canvas, modelPath) {
  console.log(`Loading Live2D model from ${modelPath}`);
  // 실제 Live2D 초기화 코드는 여기 추가
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    const dpr = window.devicePixelRatio || 1; //디스플레이 배율
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const modelFileName = 'Wanko.model3.json';
    const motionPath = '/Model/Wanko/motions/';
    const motionName = 'idle_01';  

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    this.live2DLoader = new LAppModel(canvas, modelPath, modelFileName, motionPath, motionName);
    this.live2DLoader.loadAssets();
}
</script>

<style scoped>
.hero {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: #ffffff;
  text-align: center;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.button {
  padding: 10px 20px;
  font-size: 1rem;
  background: #ffffff;
  color: #6e8efb;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.button:hover {
  background: #e0e0e0;
}

.live2d-canvas {
  width: 300px;
  height: 300px;
  margin-top: 20px;
}
</style>