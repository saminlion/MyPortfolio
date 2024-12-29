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
  import { onMounted, ref } from 'vue';
  import { LAppModel } from '../utils/LAppModel.js';
  
  const live2dCanvas = ref(null);
  const live2DLoader = ref(null);
  
  onMounted(() => {
    if (live2dCanvas.value) {
      const modelPath = '/Model/Wanko/';
      loadLive2DModel(live2dCanvas.value, modelPath);
  
      window.addEventListener('resize', () => {
        const dpr = window.devicePixelRatio || 1;
        live2dCanvas.value.width = live2dCanvas.value.clientWidth * dpr;
        live2dCanvas.value.height = live2dCanvas.value.clientHeight * dpr;
      });
    }
  });
  
  function loadLive2DModel(canvas, modelPath) {
    console.log(`Loading Live2D model from ${modelPath}`);
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }
  
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  
    const modelFileName = 'Wanko.model3.json';
    const motionPath = `${modelPath}motions/`;
    const motionName = 'idle_01';
  
    try {
      const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
      if (!gl) throw new Error('WebGL context not available!');
  
      live2DLoader.value = new LAppModel(canvas, modelPath, modelFileName, motionPath, motionName);
      live2DLoader.value.loadAssets(() => {
        console.log('Live2D model loaded successfully!');
      });
    } catch (error) {
      console.error('Error loading Live2D model:', error.message);
    }
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
  