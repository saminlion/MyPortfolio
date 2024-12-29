<template>
    <section class="skills-view">
      <div class="title-bar">
        <h2>{{ $t('skills.title') }}</h2>
      </div>
  
      <div class="skills-grid">
        <div v-for="skillCategory in skills" :key="skillCategory.name" class="skills-card">
          <h3>{{ skillCategory.name }}</h3>
          <ul>
            <li v-for="skill in skillCategory.items" :key="skill" class="skill-item">
              {{ skill }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // 스킬 데이터 구성
  const skills = ref([
    {
      name: "Programming",
      items: ["C++", "C#", "JavaScript", "Vue.js", "Unity", "Unreal Engine"],
    },
    {
      name: "Collaboration Tools",
      items: ["Slack", "Trello", "GitHub", "Jira"],
    },
    {
      name: "Languages",
      items: ["English", "Japanese", "Korean"],
    },
  ]);
  </script>
  
  <style scoped>
  .skills-view {
    padding: 2rem;
    background: var(--background-color);
    color: var(--text-color);
  }
  
  .title-bar {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .title-bar h2 {
    font-size: 2rem;
    color: var(--text-color);
  }
  
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .skills-card {
    background: var(--button-background);
    border: 1px solid var(--button-border);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .skills-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .skills-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  .skills-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .skill-item {
    font-size: 1rem;
    margin: 0.5rem 0;
    padding: 0.3rem;
    background: var(--link-hover-color);
    color: #fff;
    border-radius: 4px;
  }
  </style>
  