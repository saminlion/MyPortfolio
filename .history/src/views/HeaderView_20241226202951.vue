<template>
  <header class="main-header">
    <div class="header-container">
      <!-- 축소된 로고 -->
      <div class="logo">
        <!-- <img src="/path/to/logo-icon.png" alt="Logo" class="logo-icon" /> -->
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="nav-menu">
        <ul>
          <li><a href="#about" @click.prevent="scrollTo('about')">{{ $t('about.title') }}</a></li>
          <li><a href="#projects" @click.prevent="scrollTo('projects')">{{ $t('project.title') }}</a></li>
          <li><a href="#skills" @click.prevent="scrollTo('skills')">{{ $t('skill.title') }}</a></li>
        </ul>
      </nav>

      <!-- 언어 및 테마 선택 -->
      <div class="controls">
        <div class="language-switcher">
          <Button label="한국어" @click="translate(0)" variant="outlined"></Button>
          <Button label="English" @click="translate(1)" variant="outlined"></Button>
          <Button label="日本語" @click="translate(2)" variant="outlined"></Button>
        </div>
        <div class="theme-toggle">
          <button v-if="!isDark" @click="toggleDarkMode()">🌞</button>
          <button v-if="isDark" @click="toggleDarkMode()">🌜</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const isDark = ref(false);
const languages = ['ko', 'en', 'jp'];
const currentLanguage = ref('en');

function scrollTo(sectionId) {
  const section = document.querySelector(`#${sectionId}`);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function translate(index) {
  // Add logic for language switching (e.g., i18n locale update)
  currentLanguage.value = languages[index];
  console.log(`Language changed to: ${currentLanguage.value}`);
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark-mode');
}

watch {
    // currentLanguage 변경 감지하여 globalStore와 i18n에 반영
    currentLanguage(newLanguage) {
      this.globalStore.setLanguage(newLanguage); // Pinia 업데이트
      this.$i18n.locale = newLanguage; // i18n 로케일 업데이트
      console.log('Language changed to:', newLanguage);
    }
  }
</script>

<style scoped>
.main-header {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo .logo-icon {
  width: 40px;
  height: 40px;
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
  color: #333;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.nav-menu ul li a:hover {
  color: #6e8efb;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-switcher button {
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
  margin: 0 5px;
}

.language-switcher button:hover {
  background: #f0f0f0;
}

.theme-toggle button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>
