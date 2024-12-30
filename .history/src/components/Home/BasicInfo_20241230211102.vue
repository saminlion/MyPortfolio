<template>
      <div class="home-container">
        <h2 class="home-title">{{ $t('home.name') }}</h2>
    
        <Divider />
    
        <h2 class="home-description">{{ $t('home.description') }}</h2>
      </div>
    </template>
    
    <style scoped>
    .home-container {
      padding: 1rem;
      text-align: center; /* 텍스트를 가운데 정렬 */
    }
    
    .home-title {
      font-size: 2rem; /* 제목의 글꼴 크기 */
      font-weight: bold; /* 굵게 */
      margin-bottom: 1rem; /* 아래쪽 여백 */
    }
    
    .home-description {
      font-size: 1.2rem; /* 설명의 글꼴 크기 */
      font-weight: normal;
      max-width: 600px; /* 가로 최대 길이 제한 */
      margin: 0 auto; /* 가운데 정렬 */
      line-height: 1.6; /* 줄 간격 */
      color: #555; /* 설명 텍스트 색상 */
    }
    </style>