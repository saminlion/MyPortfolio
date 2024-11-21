<template>
    <div class="project-item">
      <Dialog :visible="visible" :style="{ width: '40rem' }" @hide="close" :closable="false" :modal="true">

        <!-- 프로젝트 기본 정보 -->
         <template #header>
          <h3>{{ project.name }}</h3>
          <Button icon="pi pi-times" severity="secondary" @click="close"></Button>
        </template>

         
        <p v-if="project.downloadLink"><strong>다운로드: </strong>
          <a :href="project.downloadLink" target="_blank">{{ project.downloadLink }}</a>
        </p>

        <!-- 프로젝트 이미지 -->
        <img :src="project.imageUrl" alt="Project image" class="project-image">

        <!-- 데모 영상 링크 -->
        <p v-if="project.demoVideo"><strong>데모 동영상:</strong>
          <!-- <a :href="project.demoVideo" target="_blank">데모 영상 보기</a> -->
          <youtube-video-player :youtubeUrl="project.demoVideo">데모 영상 보기</youtube-video-player>
        </p>

        <!-- 개발 기간, 참여 인원, 개발 환경 등 -->
        <p><strong>개발 기간:</strong> {{ project.developmentPeriod }}</p>
        <p><strong>참여 인원:</strong> {{ project.teamSize }}</p>
        <p><strong>개발 환경:</strong> {{ project.tools.join(', ') }}</p>
        <p><strong>게임 소개:</strong> {{ project.description }}</p>
        <p><strong>주된 역할:</strong> {{ project.role }}</p>

        <!-- 프로젝트 세부 설명 리스트 -->
        <ul>
          <li class="detail-list" v-for="(detail, index) in project.details" :key="index">
            {{ detail }}
          </li>
        </ul>
      </Dialog>
    </div>
</template>

<script>
import { Button } from 'primevue';
import YoutubeVideoPlayer from './YoutubeVideoPlayer.vue';

export default {
  components: {
    YoutubeVideoPlayer
  },

  props: {
    project: {
      type: Object,
      required: true
    },
    visible:{
      type: Boolean,
      required: true
    }
  },

  methods:{
    close(){
      console.log("close dialog");
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style scoped>
.project-item {
  margin-bottom: 2em;
  padding: 1em;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.project-image {
  width: 100%;
  max-width: 640px;
  height: auto;
  margin: 1em 0;
}

.detail-list {
  margin: 1em 0;
}
</style>