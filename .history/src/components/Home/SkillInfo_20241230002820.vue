<template>
    <section class="skills-section">
      <h2>{{ $t('skill.title') }}</h2>
  
      <div class="tab-container">
        <button
          v-for="(category, index) in skillCategories"
          :key="index"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ category.title }}
        </button>
      </div>
  
      <div class="skills-content">
        <div v-for="(skill, index) in skillCategories[activeTab].skills" :key="index" class="skill-item">
          {{ skill }}
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const skillCategories = [
    { title: 'Programming Skills', skills: ['C++', 'C#', 'Unity3D', 'Unreal Engine', 'JavaScript', 'Vue.js'] },
    { title: 'Collaboration Skills', skills: ['Slack', 'TortoiseSVN', 'GitHub', 'Naver Works'] },
    { title: 'Languages', skills: ['日本語', 'English'] },
  ];
  
  const activeTab = ref(0);
  </script>
  
  <style scoped>
  .skills-section {
    padding: 2rem;
    text-align: center;
  }
  
  .tab-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .tab-container button {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
  }
  
  .tab-container button.active {
    background: var(--link-hover-color);
    color: #fff;
  }
  
  .skills-content {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .skill-item {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }
  </style>
  