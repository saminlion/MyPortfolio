<template>
    <section id="skills" class="skills-section">
      <h2 class="skills-title">{{ $t('skill.title') }}</h2>
  
      <div class="skills-category" v-for="category in skillCategories" :key="category.name">
        <h3 class="skills-category-title">{{ category.title }}</h3>
        <ul class="skills-list">
          <li v-for="skill in category.skills" :key="skill.label" class="skills-item">
            <span class="skill-name">{{ skill.label }}</span>
            <span class="skill-value">{{ skill.value }}%</span>
          </li>
        </ul>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const skillCategories = ref([
    {
      name: 'programming',
      title: 'Programming Languages & Tools',
      skills: [
        { label: 'C++', value: 80 },
        { label: 'C#', value: 84 },
        { label: 'Unity', value: 84 },
        { label: 'Unreal Engine', value: 80 },
        { label: 'JavaScript', value: 70 },
        { label: 'Vue.js', value: 60 },
      ],
    },
    {
      name: 'collaboration',
      title: 'Collaboration Tools',
      skills: [
        { label: 'Slack', value: 70 },
        { label: 'TortoiseSVN', value: 84 },
        { label: 'Github', value: 84 },
        { label: 'Naver Works', value: 80 },
      ],
    },
    {
      name: 'languages',
      title: 'Languages',
      skills: [
        { label: '日本語', value: 80 },
        { label: 'English', value: 85 },
      ],
    },
  ]);
  </script>
  
  <style scoped>
  .skills-section {
    padding: 2rem;
    background-color: var(--background-color);
    color: var(--text-color);
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .skills-title {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .skills-category {
    margin-bottom: 2rem;
  }
  
  .skills-category-title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--link-hover-color);
  }
  
  .skills-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .skills-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border: 1px solid var(--button-border);
    border-radius: 4px;
    margin-bottom: 0.5rem;
    background-color: var(--button-background);
  }
  
  .skill-name {
    font-weight: bold;
  }
  
  .skill-value {
    font-size: 0.9rem;
    color: var(--link-color);
  }
  </style>
  