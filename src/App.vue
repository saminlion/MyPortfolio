<template>
  <div id="app">
    <HeaderView class="header" @navigate="handleNavigation"/>

    <main class="content">
      <AboutView v-if="currentView === 'about'" />
      <ProjectView v-if="currentView === 'projects'"/>
      <SkillsView v-if="currentView === 'skills'"/>
    </main>

    <ContactView class="footer" />
  </div>
</template>

<script>
import HeaderView from './views/HeaderView.vue'
import AboutView from './views/AboutView.vue';
import ProjectView from './views/ProjectView.vue';
import SkillsView from './views/SkillsView.vue';
import ContactView from './views/ContactView.vue';

export default {
  components: {
    HeaderView,
    AboutView,
    ProjectView,
    SkillsView,
    ContactView
  },

  data() {
    return{
      currentView: 'about'
    };
  },

  methods: {
    handleNavigation(view){
      this.currentView = view;
    }
  }
};
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
  z-index: 1000; /* 다른 요소 위에 위치 */
}

/* 가운데 내용은 스크롤 가능 */
.content {
  flex: 1; /* 남은 공간을 채움 */
  margin-top: 60px; /* 헤더 높이만큼 여백 추가 */
  margin-bottom: 90px; /* 푸터 높이만큼 여백 추가 */
  overflow-y: auto; /* 스크롤 가능 */
  padding: 1em;
  min-height: calc(100vh - 150px);
}

/* 커스텀 스크롤바 */
.content {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #ccc #f9f9f9;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
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
  z-index: 1000; /* 다른 요소 위에 위치 */
}
</style>