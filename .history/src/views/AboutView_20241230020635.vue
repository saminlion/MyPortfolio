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
  .about-section {
    padding: 1.5rem;
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .tabs button {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
  }
  
  .tabs button.active {
    background: var(--link-hover-color);
    color: white;
  }
  
  .tab-content {
    padding: 1rem;
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .dark-mode {
    --button-background: #333;
    --button-border: #555;
    --link-hover-color: #777;
    --text-color: #fff;
  }
  
  .light-mode {
    --button-background: #fff;
    --button-border: #ccc;
    --link-hover-color: #007bff;
    --text-color: #000;
  }
  </style>