<template>
    <section id="about" class="about-section">
      <h2>{{ $t('about.title') }}</h2>
  
      <!-- Tabs -->
      <div class="tab-buttons">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <!-- Tab Content -->
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
                  <li v-for="(desc, i) in item.description" :key="i">{{ desc }}</li>
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
                  <li v-for="(desc, i) in item.description" :key="i">{{ desc }}</li>
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
  
  <script setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useGlobalStore } from '@/store/globalStore';
  
  const { t, tm } = useI18n(); // `t` for translations, `tm` for merged translations.
  const globalStore = useGlobalStore();
  
  const activeTab = ref(0);

  const tabs = ref([
    { label: t('about.title') },
    { label: t('about.experience.title') },
    { label: t('about.personality.title') },
    { label: t('about.caree.titler') },
    { label: t('about.education.title') },
  ]);
  
  const getItems = (key) => {
    const items = tm(key, { returnObjects: true });
    return Array.isArray(items) ? items : [];
  };
  
  const toggleDarkMode = () => {
    globalStore.isDark = !globalStore.isDark;
    document.documentElement.classList.toggle('dark-mode', globalStore.isDark);
  };
  </script>
  
  <style scoped>
  #about {
    padding: 2rem 1rem;
    margin: 0 auto;
    text-align: center;
  }
  
  .tab-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .tab-buttons button {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
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
    padding: 1.5rem;
    max-width: 700px;
    margin: 0 auto;
    text-align: left;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    line-height: 1.8rem;
  }
  </style>
  