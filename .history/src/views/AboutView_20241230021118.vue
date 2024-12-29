<template>
    <section id="about" class="about-section">
      <h2>{{ $t('about.title') }}</h2>
  
      <div class="tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <div class="tab-content">
        <div v-show="activeTab === 0">
          <p>{{ $t('about.vision') }}</p>
        </div>
  
        <div v-show="activeTab === 1">
          <div class="beforeExp">
            <h3>{{ $t('about.experience.before.title') }}</h3>
            <p>{{ $t('about.experience.before.content') }}</p>
          </div>
          <Divider />
          <div class="afterExp">
            <h3>{{ $t('about.experience.after.title') }}</h3>
            <p>{{ $t('about.experience.after.content') }}</p>
          </div>
        </div>
  
        <div v-show="activeTab === 2">
          <p>{{ $t('about.personality.content') }}</p>
        </div>
  
        <div v-show="activeTab === 3">
          <ul>
            <li v-for="(item, index) in getItems('about.career.items')" :key="index">
              <strong>{{ item.date }}</strong><br />
              {{ item.title }}<br />
              <span v-if="Array.isArray(item.description)">
                <ul>
                  <li v-for="(desc, i) in item.description" :key="i">
                    {{ desc }}
                  </li>
                </ul>
              </span>
              <span v-else>{{ item.description }}</span>
              <Divider />
            </li>
          </ul>
        </div>
  
        <div v-show="activeTab === 4">
          <ul>
            <li v-for="(item, index) in getItems('about.education.items')" :key="index">
              <strong>{{ item.date }}</strong><br />
              {{ item.title }}<br />
              <span v-if="Array.isArray(item.description)">
                <ul>
                  <li v-for="(desc, i) in item.description" :key="i">
                    {{ desc }}
                  </li>
                </ul>
              </span>
              <span v-else>{{ item.description }}</span>
              <Divider />
            </li>
          </ul>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  import { useI18n } from 'vue-i18n';
  import { useGlobalStore } from '@/store/globalStore';
  import { ref } from 'vue';
  
  export default {
    setup() {
      const globalStore = useGlobalStore();
      const activeTab = ref(0);
  
      const tabs = [
        { label: 'Vision' },
        { label: 'Experience' },
        { label: 'Personality' },
        { label: 'Career' },
        { label: 'Education' },
      ];
  
      const getItems = (key) => {
        const { tm } = useI18n();
        const items = tm(key, { returnObjects: true });
        if (!Array.isArray(items)) {
          console.error('Items are not an array:', items);
          return [];
        }
        return items;
      };
  
      const toggleDarkMode = () => {
        const html = document.documentElement;
        globalStore.isDark = !globalStore.isDark;
        html.classList.toggle('dark-mode', globalStore.isDark);
      };
  
      return { activeTab, tabs, getItems, toggleDarkMode };
    },
  };
  </script>
  
  <style scoped>
  #about {
    padding: 2rem 1rem;
    width: 100%;
    height: 100%;
    margin: 0 auto; /* 중앙 정렬 */
    text-align: center;
}
  
  .tab-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5rem; /* 탭 간의 간격 줄임 */
    margin-bottom: 1rem;
  }
  
  .tab-buttons button {
    flex: 0 0 auto; /* 버튼 크기를 고정 */
    padding: 0.5rem 1rem;
    background: var(--button-background);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;
    max-width: 150px; /* 각 탭의 최대 너비 설정 */
    white-space: nowrap; /* 글자 줄바꿈 방지 */
  }
  
  .tab-buttons button.active {
    background: var(--link-hover-color);
    color: #fff;
  }
  
  .tab-buttons button:hover {
    background: var(--button-hover-background);
    color: var(--button-hover-text);
  }
  
  .tab-content {
    background: var(--button-background);
    color: var(--text-color);
    border-radius: 8px;
    padding: 1rem;
    text-align: left;
    max-width: 700px; /* 내용의 최대 너비 */
    margin: 0 auto; /* 중앙 정렬 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  </style>