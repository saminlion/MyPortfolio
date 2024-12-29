<template>
    <section id="skills">
      <h2>{{ $t('skill.title') }}</h2>
  
      <div class="skill-category">
        <h3>{{ $t('skill.program') }}</h3>
        <ul>
          <li v-for="programing in programings" :key="programing.label">
            {{ programing.label }}
          </li>
        </ul>
      </div>
  
      <div class="skill-category">
        <h3>{{ $t('skill.coop') }}</h3>
        <ul>
          <li v-for="coop in coops" :key="coop.label">
            {{ coop.label }}
          </li>
        </ul>
      </div>
  
      <div class="skill-category">
        <h3>{{ $t('skill.etc') }}</h3>
        <ul>
          <li v-for="language in languages" :key="language.label">
            {{ language.label }}
          </li>
        </ul>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const programings = ref([
    { label: "C++" },
    { label: "C#" },
    { label: "Unity" },
    { label: "Unreal Engine" },
    { label: "JavaScript" },
    { label: "Vue.js" }
  ]);
  
  const coops = ref([
    { label: "Slack" },
    { label: "TortoiseSVN" },
    { label: "GitHub" },
    { label: "Naver Works" }
  ]);
  
  const languages = ref([
    { label: "日本語" },
    { label: "English" }
  ]);
  </script>
  
  <style scoped>
  #skills {
    padding: 2rem;
    font-family: Arial, sans-serif;
    color: #333;
  }
  
  #skills h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    color: #4a4a4a;
  }
  
  .skill-category {
    margin-bottom: 2rem;
  }
  
  .skill-category h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #555;
  }
  
  .skill-category ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .skill-category ul li {
    font-size: 1.2rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eaeaea;
  }
  </style>