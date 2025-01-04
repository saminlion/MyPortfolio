<template>
  <!-- Hero 섹션 -->
  <section class="hero">
    <!-- Hero 헤더 -->
    <div class="hero-header">
      <!-- 네비게이션 메뉴 -->
      <nav class="nav-menu">
        <ul>
          <!-- 홈 링크 -->
          <li>
            <router-link to="/" :class="{ active: currentPage === 'home' }">{{ $t('home.title') }}</router-link>
          </li>
          <!-- 프로젝트 링크 -->
          <li>
            <router-link to="/projects" :class="{ active: currentPage === 'projects' }">{{ $t('project.title') }}</router-link>
          </li>
          <!-- 소개 링크 -->
          <li>
            <router-link to="/about" :class="{ active: currentPage === 'about' }">{{ $t('about.title') }}</router-link>
          </li>
        </ul>
      </nav>

      <!-- 컨트롤 섹션 -->
      <div class="controls">
        <!-- 언어 변경 스위처 -->
        <div class="language-switcher">
          <span class="current-language">{{ currentLanguage }}</span>
          <button
            v-for="(lang, index) in languages"
            :key="lang"
            @click="translate(index)"
            :class="{ active: locale.value === lang }"
          >
            {{ lang.toUpperCase() }}
          </button>
        </div>

        <!-- 다크 모드 토글 -->
        <div class="theme-toggle">
          <!-- 라이트 모드 버튼 -->
          <button v-if="!isDark" @click="toggleDarkMode()">🌞</button>
          <!-- 다크 모드 버튼 -->
          <button v-if="isDark" @click="toggleDarkMode()">🌜</button>
        </div>
      </div>
    </div>

    <div>
    <!-- Hero 콘텐츠: Live2D 캔버스와 페이지 내용 -->
     <div v-if="isLoading" class="loading-overlay">
      <ProgressSpinner />
        <p>Loading Live2D Model...</p>
     </div>


    <div class="hero-content detail-layout">
      <!-- 디졸브 애니메이션이 포함된 캔버스 -->
      <div
        v-show="!animationCompleted"
        :class="{ dissolve: isDetailView }"
        @animationend="onDissolveComplete"
        class="canvas-box"
      ></div>

      <!-- 프로젝트 상세보기 -->
      <div v-show="animationCompleted" v-if="isProject" class="project-detail-container">
        <ProjectDetailView />
      </div>

      <!-- 홈 콘텐츠 -->
      <div v-show="isHome" class="home-info">
        <HomeInfo />
      </div>

      <!-- 소개 콘텐츠 -->
      <div class="about-info" v-show="isAbout">
        <AboutView />
      </div>

      <!-- Live2D 캔버스 -->
      <canvas ref="live2dCanvas" class="live2d-canvas" @click="Live2DClick"></canvas>
    </div>
  </div>
  </section>
</template>

<script setup>
/* Vue 관련 기능 가져오기 */
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // 현재 라우트 정보를 가져오기 위한 Vue Router
import { useI18n } from 'vue-i18n'; // 다국어 지원 라이브러리
import { LAppModel } from '../utils/LAppModel.js'; // Live2D 모델을 로드하고 조작하는 유틸리티 클래스
import { useGlobalStore } from '@/store/globalStore'; // 전역 상태 관리 (Pinia)
import ProjectDetailView from '../components/Project/ProjectDetailView.vue'; // 프로젝트 상세보기 컴포넌트
import { useProjectStore } from '@/store/projectStore'; // 프로젝트 상태 관리 (Pinia)
import HomeInfo from '@/components/Home/HomeInfo.vue'; // 홈 화면 컴포넌트
import AboutView from './AboutView.vue'; // 소개 화면 컴포넌트

/* 캔버스 및 Live2D 로더 관련 상태 */
const live2dCanvas = ref(null); // Live2D 캔버스 참조
const live2DLoader = ref(null); // Live2D 모델 로더
const isLoading = ref(true);

/* Pinia 상태 */
const projectStore = useProjectStore(); // 프로젝트 상태 관리
const globalStore = useGlobalStore(); // 글로벌 상태 관리

/* 라우트 및 다국어 관련 상태 */
const route = useRoute(); // 현재 라우트 정보
const { locale } = useI18n(); // 현재 언어 설정

/* 상태 변수 선언 */
const currentLanguage = ref(''); // 현재 선택된 언어
const languages = ['ko', 'en', 'jp']; // 지원 언어 목록
const isDark = ref(false); // 다크 모드 활성화 여부
const isProject = ref(false); // 현재 프로젝트 페이지 여부
const isAbout = ref(false); // 현재 소개 페이지 여부
const isHome = ref(true); // 현재 홈 페이지 여부

/* 페이지별 텍스트와 Live2D 모델 정보 */
const texts = {
  home: { title: 'Welcome to My Portfolio', subtitle: 'Specializing in VTuber and VR' },
  projects: { title: 'Explore My Projects', subtitle: 'Filter and discover my work' },
  about: { title: 'About Me', subtitle: 'Learn more about my journey' },
};
const models = {
  home: { modelPath: '/Model/Wanko/', modelFileName: 'Wanko.model3.json', motionName: '00_idle', poseFileName: '', scale: 2.5, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
  projects: { modelPath: '/Model/Rice/', modelFileName: 'Rice.model3.json', motionName: 'haru_g_m15', poseFileName: '', scale: 1.5, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
  about: { modelPath: '/Model/tororo/', modelFileName: 'tororo.model3.json', motionName: '00_idle', poseFileName: 'tororo.pose3.json', scale: 1.6, xPos: 0, yPos: 0, groupName: 'Idle', groupIndex: 0 },
};

/* 현재 페이지 상태 */
const currentPage = ref(route.name || 'home'); // 현재 라우트 이름
const currentText = ref(texts[currentPage.value]);  // 현재 페이지 텍스트
const currentModel = ref(models[currentPage.value] || models.home); // 현재 페이지 Live2D 모델

/* 애니메이션 및 상세보기 상태 */
const isDetailView = ref(false); // 상세보기 모드 활성화 여부
const animationCompleted = ref(false); // 애니메이션 완료 여부

/* 라우트 변경 감지 및 상태 업데이트 */
watch(
  () => route.name,
  (newPage) => {
    currentPage.value = newPage; // 현재 라우트 업데이트

    currentText.value = texts[newPage] || texts.home; // 페이지에 맞는 텍스트 설정

    currentModel.value = models[newPage] || models.home;// 페이지에 맞는 Live2D 모델 설정

    if (currentPage.value === 'projects') {
      animationCompleted.value = false; // 상태 초기화
      isProject.value = true;
      isHome.value = false;
      isAbout.value = false;
    }

    else if (currentPage.value === 'home') {
      animationCompleted.value = true; // 상태 초기화
      isProject.value = false;
      projectStore.id = 0; // 프로젝트 상태 초기화
      isHome.value = true;
      isAbout.value = false;
    }
    else {
      animationCompleted.value = true; // 상태 초기화
      isProject.value = false;
      projectStore.id = 0; // 프로젝트 상태 초기화
      isHome.value = false;
      isAbout.value = true;
    }
    console.log('currentPage.value', currentPage.value, isProject.value, isHome.value);

    loadLive2DModel(); // Live2D 모델 로드
  }
);

/* 상세보기 상태 변경 감지 */
watch(isDetailView, (newVal) => {

  if (newVal) {
    console.log("Dissolve effect triggered");

    live2DLoader.value.CustomMotion('TapBody', 0, 2, false, () => {
      console.log('Dissolve animation starting...');

      triggerDissolveAnimation(); // 디졸브 애니메이션 실행
    });
  }
});

/* 프로젝트 ID 상태 변경 감지 */
watch(
  () => projectStore.id,
  (id) => {

    console.log(id);

    isDetailView.value = id != 0; // ID가 0이 아니면 상세보기 활성화
  }
);

/* Live2D 캔버스를 클릭했을 때 동작 */
function Live2DClick() {
  if (currentPage.value !== 'projects') {
    live2DLoader.value.CustomMotion('Tap', 0, 2, true);
  }
}

/* 디졸브 애니메이션 실행 */
function triggerDissolveAnimation() {
  const canvas = document.querySelector('.canvas-box');

  if (!canvas) {
    console.error('Canvas not found for dissolve animation');
    return;
  }

  canvas.classList.add('dissolve-effect'); // CSS 애니메이션 클래스 추가

  // 애니메이션 종료 후 처리
  canvas.addEventListener('animationend', () => {
    console.log('Dissolve animation completed');
    canvas.classList.remove('dissolve-effect');
  }, { once: true }); // 이벤트 한 번만 실행
}

/* 디졸브 애니메이션 종료 처리 */
function onDissolveComplete() {
  animationCompleted.value = true;
}

/* Live2D 모델 로드 함수 */
async function loadLive2DModel() {
  if (!live2dCanvas.value) {
    console.error('Canvas element not found!');
    return;
  }

  const { modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos, groupName, groupIndex } = currentModel.value;

  const canvas = live2dCanvas.value;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  try {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL context not available!');

    isLoading.value = true;

    live2DLoader.value = new LAppModel(canvas, modelPath, modelFileName, motionName, poseFileName, scale, xPos, yPos, groupName, groupIndex);
    await live2DLoader.value.initialize(); // 모델 초기화

    isLoading.value = false;

    // live2DLoader.value.startIdleAnimation();
  } catch (error) {
    console.error('Error loading Live2D model:', error.message);
  }
}

function translate(index) {
  const selectedLanguage = languages[index];
  locale.value = selectedLanguage; // 언어 변경
  globalStore.setLanguage(selectedLanguage); // Pinia 업데이트
  currentLanguage.value = languages[index].toUpperCase(); // 현재 언어 표시 업데이트
  localStorage.setItem('currentLanguage', currentLanguage.value); // 로컬 스토리지에 언어 저장
}

/* 다크 모드 토글 함수 */
function toggleDarkMode() {
  const htmlElement = document.documentElement;
  isDark.value = !isDark.value; // 다크 모드 상태 변경
  if (isDark.value) {
    htmlElement.classList.add('dark-mode'); // 다크 모드 활성화
  } else {
    htmlElement.classList.remove('dark-mode');// 다크 모드 비활성화
  }
  localStorage.setItem('darkMode', isDark.value);// 로컬 스토리지에 저장
}

onMounted(() => {
  loadLive2DModel(); // Live2D 모델 로드

  const storedTheme = localStorage.getItem('darkMode'); // 저장된 테마 확인
  if (storedTheme === 'true') {
    isDark.value = true;
    document.documentElement.classList.add('dark-mode');
  }


  if (currentPage.value === 'home') {
    // 초기 상태 설정
    animationCompleted.value = true;
    isProject.value = false;
    projectStore.id = 0;
    isHome.value = true;
  }

  // 저장된 언어 불러오기
  const savedLanguage = localStorage.getItem('currentLanguage') || 'EN';
  currentLanguage.value = savedLanguage;
  locale.value = savedLanguage.toLowerCase();
});
</script>

<style scoped>
/* Hero 섹션 스타일 */
.hero {
  /* Hero 전체 레이아웃 설정 */
  position: relative; /* 부모 요소 위치 설정 */
  height: 150vh; /* 화면 높이 기준 1.5배로 설정 */
  display: flex; /* Flexbox 레이아웃 사용 */
  flex-direction: column; /* Flexbox 방향: 위에서 아래로 */
  justify-content: space-between; /* 요소 간 간격 균등 배치 */
  align-items: center; /* 요소를 수평 중앙 정렬 */
  background: var(--hero-background); /* 배경색 또는 배경 이미지 */
  color: var(--text-color); /* 텍스트 색상 */
  text-align: center; /* 텍스트 가운데 정렬 */
  padding: 1rem; /* 안쪽 여백 설정 */
}

/* Hero 헤더 스타일 */
.hero-header {
  display: flex; /* Flexbox 레이아웃 */
  justify-content: space-between; /* 헤더 내부 요소 좌우 정렬 */
  align-items: center; /* 요소를 수직 중앙 정렬 */
  width: 100%; /* 전체 너비 사용 */
  padding: 1rem; /* 안쪽 여백 */
  background: var(--header-background); /* 헤더 배경색 */
}

/* 네비게이션 메뉴 스타일 */
.nav-menu ul {
  display: flex; /* Flexbox 레이아웃 */
  gap: 1.5rem; /* 항목 간 간격 */
  list-style: none; /* 기본 리스트 스타일 제거 */
  padding: 0; /* 리스트 패딩 제거 */
  margin: 0; /* 리스트 마진 제거 */
}

.nav-menu ul li a {
  text-decoration: none; /* 링크 밑줄 제거 */
  color: var(--link-color); /* 링크 텍스트 색상 */
  font-size: 1rem; /* 링크 글꼴 크기 */
}

.nav-menu ul li a.active {
  font-weight: bold; /* 활성화된 링크는 굵게 표시 */
  color: var(--link-hover-color); /* 활성화된 링크 색상 */
}

/* 컨트롤 영역 (언어 전환 및 테마 전환 버튼) */
.controls {
  display: flex; /* Flexbox 레이아웃 */
  align-items: center; /* 요소를 수직 중앙 정렬 */
  gap: 1rem; /* 버튼 간 간격 */
}

/* 언어 전환 버튼 스타일 */
.language-switcher {
  display: flex; /* Flexbox 레이아웃 */
  align-items: center; /* 요소를 수직 중앙 정렬 */
  gap: 1rem; /* 버튼 간 간격 */
}

.language-switcher .current-language {
  font-size: 1rem; /* 현재 언어 표시 글꼴 크기 */
  font-weight: bold; /* 글꼴 굵게 */
  color: var(--text-color); /* 텍스트 색상 */
  margin-right: 1rem; /* 오른쪽 여백 */
}


.language-switcher button {
  width: 50px; /* 버튼 너비 */
  height: 30px; /* 버튼 높이 */
  font-size: 0.9rem; /* 버튼 글꼴 크기 */
  text-transform: uppercase; /* 텍스트 대문자 변환 */
  background: var(--button-background); /* 버튼 배경색 */
  color: var(--button-text); /* 버튼 텍스트 색상 */
  border: 1px solid var(--button-border); /* 버튼 테두리 */
  border-radius: 4px; /* 버튼 모서리 둥글게 */
  cursor: pointer; /* 마우스 커서를 포인터로 변경 */
  transition: background 0.3s ease, color 0.3s ease; /* 전환 효과 */
  box-sizing: border-box; /* 박스 모델 크기 포함 */
}

.language-switcher button.active {
  background: var(--link-hover-color); /* 활성화된 버튼 배경색 */
  color: #fff; /* 활성화된 버튼 텍스트 색상 */
}


.language-switcher button:hover {
  background: var(--button-hover-background); /* 버튼 호버 시 배경색 */
  color: var(--button-hover-text); /* 버튼 호버 시 텍스트 색상 */
}

/* 다크 모드 토글 버튼 */
.theme-toggle button {
  background: none; /* 배경 없음 */
  border: none; /* 테두리 없음 */
  font-size: 1.2rem; /* 버튼 글꼴 크기 */
  cursor: pointer; /* 마우스 커서를 포인터로 변경 */
}


/* Hero 콘텐츠 섹션 스타일 */
.hero-content {
  position: relative; /* 부모 요소 위치 */
  display: flex; /* Flexbox 레이아웃 */
  justify-content: space-between; /* 요소 간 간격 균등 배치 */
  align-items: flex-start; /* Flexbox 내부 요소 상단 정렬 */
  width: 90vw; /* 전체 화면 너비의 90%로 설정 */
  max-width: 1500px; /* 콘텐츠 최대 너비 제한 */
  height: 90vh; /* 콘텐츠 높이 제한 */
  padding: 1rem; /* 콘텐츠 안쪽 여백 */
  margin: 0 auto; /* 중앙 정렬 */
}

.detail-layout {
  position: relative;  /* 부모 요소 */
  flex-direction: row;
  justify-content: space-between; /* 요소 간 간격 균등 배치 */
}


/* 프로젝트 상세보기 컨테이너 */
.project-detail-container {
  flex: 2; /* Flexbox 비율 2 할당 */
  max-width: 50%; /* 최대 너비 제한 */
  left: 0%; /* 왼쪽 정렬 */
  margin-right: 2rem; /* 오른쪽 여백 */
  background: var(--button-background); /* 배경색 */
  border: 1px solid var(--button-border); /* 테두리 */
  border-radius: 8px; /* 모서리 둥글게 */
  padding: 1rem; /* 안쪽 여백 */
  overflow-y: auto; /* 세로 스크롤 가능 */
  height: auto; /* 자동 높이 조정 */
}

/* 캔버스 박스 */
.canvas-box {
  display: block; /* 블록 요소로 표시 */
  flex: 1; /* Flexbox 비율 1 할당 */
  max-width: 50%; /* 최대 너비 제한 */
  height: 600px; /* 고정된 높이 */
  background-color: #000; /* 검은색 배경 */
  border-radius: 8px; /* 모서리 둥글게 */
}

/* 디졸브 애니메이션 효과 */
.dissolve-effect {
  animation: dissolveEffect 1.5s forwards; /* 애니메이션 1.5초 진행 후 정지 */
}

@keyframes dissolveEffect {
  0% {
    opacity: 1; /* 초기 투명도 100% */
  }

  100% {
    opacity: 0; /* 최종 투명도 0% */
    transform: scale(1.1); /* 요소 크기를 1.1배로 확대 */
  }
}

/* 홈 화면 콘텐츠 스타일 */
.home-info {
  position: relative; /* 상대적 위치 */
  width: 100%; /* 전체 너비 */
  max-width: 800px; /* 가로 최대 길이 제한 */
  left: 0;
  text-align: center; /* 텍스트 가운데 정렬 */
  height: 860px; /* 고정된 높이 */
  padding: 1rem 1rem; /* 상하 좌우 여백 */
  background: var(--button-background); /* 배경색 */
  border: 1px solid var(--button-border); /* 테두리 */
  border-radius: 8px; /* 모서리 둥글게 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
}

/* 소개 화면 콘텐츠 스타일 */
.about-info {
  position: relative; /* 상대적 위치 */
  top: 50%; /* 수직 중앙 정렬 */
  left: 0; /* 왼쪽 정렬 */
  transform: translateY(-50%); /* 세로 중앙 보정 */
  width: 100%; /* 전체 너비 */
  height: 800px; /* 고정된 높이 */
  max-width: 800px; /* 가로 최대 길이 제한 */
  background: var(--button-background); /* 배경색 */
  border: 1px solid var(--button-border); /* 테두리 */
  border-radius: 8px; /* 모서리 둥글게 */
  padding: 1rem; /* 안쪽 여백 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  overflow: auto; /* 콘텐츠 넘칠 경우 스크롤 */
}

/* Live2D 캔버스 스타일 */
.live2d-canvas {
  position: absolute; /* 고정된 위치 */
  top: 50%; /* 세로 중앙 정렬 */
  right: 0%; /* 오른쪽 정렬 */
  transform: translateY(-50%); /* 세로 중앙 보정 */
  width: 800px; /* 고정된 너비 */
  height: 800px; /* 고정된 높이 */
  border-radius: 8px; /* 모서리 둥글게 */
  z-index: 9999; /* 최상위 레이어 */
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

</style>