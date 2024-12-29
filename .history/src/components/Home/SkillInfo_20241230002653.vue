<template>
    <section class="skills-section">
      <h2 class="section-title">{{ $t('skill.title') }}</h2>
  
      <div class="skills-container">
        <!-- 프로그래밍 스킬 -->
        <div class="skills-category">
          <h3>{{ $t('skill.program') }}</h3>
          <div class="skills-list">
            <span v-for="skill in programmingSkills" :key="skill.label" class="skill-item">
              {{ skill.label }}
            </span>
          </div>
        </div>
  
        <!-- 협업 도구 -->
        <div class="skills-category">
          <h3>{{ $t('skill.coop') }}</h3>
          <div class="skills-list">
            <span v-for="skill in collaborationSkills" :key="skill.label" class="skill-item">
              {{ skill.label }}
            </span>
          </div>
        </div>
  
        <!-- 언어 스킬 -->
        <div class="skills-category">
          <h3>{{ $t('skill.languages') }}</h3>
          <div class="skills-list">
            <span v-for="skill in languageSkills" :key="skill.label" class="skill-item">
              {{ skill.label }}
            </span>
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
    padding: 1.5rem;
    background: var(--background-color);
    color: var(--text-color);
  }
  
  .section-title {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .skills-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .skills-category {
    margin-bottom: 1.5rem;
  }
  
  .skills-category h3 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: var(--text-color);
  }
  
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  
  .skill-item {
    padding: 0.4rem 0.8rem;
    background: var(--button-background);
    color: var(--text-color);
    border: 1px solid var(--button-border);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 0.9rem;
  }
  </style>
  