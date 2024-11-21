<template>
    <div class="video-container">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="video-player"
      ></iframe>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      youtubeUrl: {
        type: String,
        required: true
      }
    },
    computed: {
      embedUrl() {
        let videoId = '';
        if (this.youtubeUrl.includes("watch?v=")) {
            videoId = this.youtubeUrl.split("v=")[1];
        }

        else if (this.youtubeUrl.includes("youtu.be/")) {
            videoId = this.youtubeUrl.split("youtu.be/")[1];
        }

        // YouTube 링크를 임베드용 URL로 변환
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      }
    }
  };
  </script>
  
  <style scoped>
  .video-container {
    width: 100%;
    max-width: 640px;
    margin: fixed;
  }
  .video-player {
    width: 100%;
    height: 360px;
  }
  </style>
  