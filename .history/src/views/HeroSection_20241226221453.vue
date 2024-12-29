<template>
    <section class="hero">
        <div class="hero-header">
            <nav class="nav-menu">
                <ul>
                    <li>
                        <router-link to="/" :class="{ active: currentPage === 'home' }">{{ $t('home.title')
                            }}</router-link>
                    </li>
                    <li>
                        <router-link to="/projects" :class="{ active: currentPage === 'projects' }">{{
                            $t('project.title') }}</router-link>
                    </li>
                    <li>
                        <router-link to="/about" :class="{ active: currentPage === 'about' }">{{ $t('about.title')
                            }}</router-link>
                    </li>
                </ul>
            </nav>
        </div>
        <div class="hero-content">
            <h1>{{ currentText.title }}</h1>
            <p>{{ currentText.subtitle }}</p>
            <div v-if="currentPage === 'projects'" class="filters">
                <label>{{ $t('filters.techStack') }}:</label>
                <select v-model="selectedFilter" @change="applyFilter">
                    <option value="all">{{ $t('filters.all') }}</option>
                    <option v-for="tech in techStacks" :key="tech" :value="tech">{{ tech }}</option>
                </select>
            </div>
            <canvas ref="live2dCanvas" class="live2d-canvas"></canvas>
        </div>
    </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const techStacks = ['Unity', 'Unreal Engine', 'Live2D', 'VR', 'Metaverse'];
const selectedFilter = ref('all');
const live2dCanvas = ref(null);
const live2DLoader = ref(null);

// 현재 페이지 추적
const route = useRoute();
const currentPage = ref(route.name);

// 페이지별 문구 및 Live2D 모델 설정
const texts = {
    home: { title: 'Welcome to My Portfolio', subtitle: 'Specializing in VTuber and VR' },
    projects: { title: 'Explore My Projects', subtitle: 'Filter and discover my work' },
    about: { title: 'About Me', subtitle: 'Learn more about my journey' },
};
const models = {
    home: {
        modelPath: '/Model/Wanko/',
        modelFileName: 'Wanko.model3.json',
        motionPath: '/Model/Wanko/motions/',
        motionName: 'idle_01'
    },

    projects: {
        modelPath: '/Model/Haru/',
        modelFileName: 'Haru.model3.json',
        motionPath: '/Model/Haru/motions/',
        motionName: 'haru_g_idle'
    },


    about: {
        modelPath: '/Model/tororo/',
        modelFileName: 'tororo.model3.json',
        motionPath: '/Model/tororo/motions/',
        motionName: '00_idle'
    },

};

const currentText = ref(texts[currentPage.value]);
const currentModel = ref(models[currentPage.value]);

// 필터링 로직
function applyFilter() {
    console.log(`Filter applied: ${selectedFilter.value}`);
    // 추가 필터 로직
}

// 페이지 변경 감지
watch(
    () => route.name,
    (newPage) => {
        currentPage.value = newPage;
        currentText.value = texts[newPage] || texts.home;
        currentModel.value = models[newPage] || models.home;
        loadLive2DModel();
    }
);

// Live2D 모델 초기화
function loadLive2DModel() {
    const { modelPath, modelFileName, motionName } = currentModel.value;

    if (!live2dCanvas.value) {
        console.error('Canvas element not found!');
        return;
    }

    console.log(`Loading Live2D model: ${modelFileName}`);

    const canvas = live2dCanvas.value;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    try {
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        if (!gl) throw new Error('WebGL context not available!');

        live2DLoader.value = new LAppModel(canvas, modelPath, modelFileName, motionName);
        live2DLoader.value.loadAssets(() => {
            console.log('Live2D model loaded successfully!');
        });

        live2DLoader.value.startIdleAnimation();
    } catch (error) {
        console.error('Error loading Live2D model:', error.message);
    }
}

// 초기 모델 로드
onMounted(() => {
    loadLive2DModel();

    const resizeHandler = () => {
        const dpr = window.devicePixelRatio || 1;
        live2dCanvas.value.width = live2dCanvas.value.clientWidth * dpr;
        live2dCanvas.value.height = live2dCanvas.value.clientHeight * dpr;
    };

    window.addEventListener('resize', resizeHandler);

    onUnmounted(() => {
        window.removeEventListener('resize', resizeHandler);
    });
});
</script>

<style scoped>
.hero {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--hero-background);
    color: var(--text-color);
    text-align: center;
}

.hero-header {
    position: sticky;
    top: 0;
    width: 100%;
    background: var(--header-background);
    padding: 1rem;
    z-index: 1000;
}

.nav-menu ul {
    display: flex;
    justify-content: center;
    list-style: none;
    gap: 1.5rem;
}

.nav-menu ul li {
    font-size: 1rem;
}

.nav-menu ul li a {
    text-decoration: none;
    color: var(--link-color);
}

.nav-menu ul li a.active {
    font-weight: bold;
    color: var(--link-hover-color);
}

.hero-content h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.filters label {
    margin-right: 0.5rem;
}

.filters select {
    padding: 0.5rem;
    border: 1px solid var(--button-border);
    border-radius: 4px;
    font-size: 1rem;
}

.live2d-canvas {
    width: 400px;
    height: 400px;
    margin-top: 2rem;
}
</style>