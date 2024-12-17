<template>
  <header class="main-header">
    <div class="header-container">
      <!-- 로고 및 제목 -->
      <div class="logo">
        <h1>{{ $t('main.title') }}</h1>
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="nav-menu">
        <ul>
          <li><a href="#" @click.prevent="navigate('about')">{{ $t('about.title') }}</a></li>
          <li><a href="#" @click.prevent="navigate('projects')">{{ $t('project.title') }}</a></li>
          <li><a href="#" @click.prevent="navigate('skills')">{{ $t('skill.title') }}</a></li>
          <!-- <li><a href="#" @click.prevent="navigate('model')">{{ $t('skill.title') }}</a></li> -->

        </ul>
      </nav>

      <!-- 언어 선택 및 테마 토글 -->
      <div class="controls">
        <div class="language-switcher">
          <Button label="한국어" @click="translate(0)" variant="outlined"></Button>
          <Button label="English" @click="translate(1)" variant="outlined"></Button>
          <Button label="日本語" @click="translate(2)" variant="outlined"></Button>
        </div>
        <div class="theme-toggle">
          <Button v-if="!isDark" icon="pi pi-sun" variant="text" @click="toggleDarkMode()" />
          <Button v-if="isDark" icon="pi pi-moon" variant="text" @click="toggleDarkMode()" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useGlobalStore } from '@/store/globalStore';
import { useI18n } from 'vue-i18n';

export default {
  data() {
    return {
      isDark: false, // 다크 모드 상태
      targetLanguage: 'en', // 선택된 언어
    };
  },
  computed: {
    globalStore() {
      return useGlobalStore(); // Pinia 스토어
    },
  },
  watch: {
    // targetLanguage 변경 감지하여 globalStore와 i18n에 반영
    targetLanguage(newLanguage) {
      this.globalStore.setLanguage(newLanguage); // Pinia 업데이트
      this.$i18n.locale = newLanguage; // i18n 로케일 업데이트
      console.log('Language changed to:', newLanguage);
    },
  },
  methods: {
    // 네비게이션 처리
    navigate(view) {
      console.log('Navigating to:', view); // 디버깅용
      this.$emit('navigate', view); // 상위로 이벤트 전달
    },
    // 다크 모드 토글
    toggleDarkMode() {
      this.isDark = !this.isDark;
      document.documentElement.classList.toggle('my-app-dark');
    },
    // 번역 버튼 액션
    translate(index) {
      if (index === 0)
    {
      this.targetLanguage = 'ko';
    }
    else if (index === 1)
    {
      this.targetLanguage = 'en';
    }
    else
    {
      this.targetLanguage = 'jp';
    }
    
    
      console.log('Current language:', this.targetLanguage); // 디버깅용
    },
  },
  mounted() {
    // 초기화
    this.targetLanguage = this.globalStore.language; // Pinia에서 초기 언어 설정
  },
};
</script>

<style scoped>
.main-header {
  background: var(--header-bg-color);
  color: var(--header-text-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.nav-menu ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav-menu ul li a {
  text-decoration: none;
  color: var(--link-color);
  font-size: 1rem;
  transition: color 0.3s;
}

.nav-menu ul li a:hover {
  color: var(--link-hover-color);
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switcher {
  display: flex;
  gap: 0.5rem;
}

.theme-toggle button {
  background: none;
  border: none;
  cursor: pointer;
}
</style>