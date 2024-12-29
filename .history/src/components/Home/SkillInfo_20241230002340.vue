<template>
    <section class="skills-section">
      <h2>{{ $t('skill.title') }}</h2>
  
      <!-- 프로그래밍 스킬 -->
      <div class="skills-category">
        <h3>{{ $t('skill.program') }}</h3>
        <div class="skills-row">
          <div v-for="skill in programmingSkills" :key="skill.label" class="skill-item">
            <span class="skill-label">{{ skill.label }}</span>
          </div>
        </div>
      </div>
  
      <!-- 협업 도구 -->
      <div class="skills-category">
        <h3>{{ $t('skill.coop') }}</h3>
        <div class="skills-row">
          <div v-for="skill in collaborationSkills" :key="skill.label" class="skill-item">
            <span class="skill-label">{{ skill.label }}</span>
          </div>
        </div>
      </div>
  
      <!-- 언어 스킬 -->
      <div class="skills-category">
        <h3>{{ $t('skill.languages') }}</h3>
        <div class="skills-row">
          <div v-for="skill in languageSkills" :key="skill.label" class="skill-item">
            <span class="skill-label">{{ skill.label }}</span>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  const programmingSkills = [
    { label: "C++" },
    { label: "C#" },
    { label: "Unity3D" },
    { label: "Unreal Engine" },
    { label: "JavaScript" },
    { label: "Vue.js" },
  ];
  
  const collaborationSkills = [
    { label: "Slack" },
    { label: "TortoiseSVN" },
    { label: "GitHub" },
    { label: "Naver Works" },
  ];
  
  const languageSkills = [
    { label: "日本語" },
    { label: "English" },
  ];
  </script>
  
  <style scoped>
  .skills-section {
    padding: 2rem;
  }
  
  .skills-category {
    margin-bottom: 2rem;
  }
  
  .skills-category h3 {
    margin-bottom: 1rem;
  }
  
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .skill-item {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    color: var(--text-color);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: default;
  }
  </style>