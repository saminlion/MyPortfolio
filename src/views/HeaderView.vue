<template>
    <header>
      <h1>클라이언트 개발 포트폴리오</h1>
      <nav>
        <a href="#" @click.prevent="navigate('about')">About</a>
        <a href="#" @click.prevent="navigate('projects')">Projects</a>
        <a href="#" @click.prevent="navigate('skills')">Skills</a>

        <Button v-if="!isDark" icon="pi pi-sun" variant="text" @click="toggleDarkMode()"></Button>
        <Button v-if="isDark" icon="pi pi-moon" variant="text" @click="toggleDarkMode()"></Button>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    data(){
      return{
        isDark: false,
      }
    },

    methods:{
      navigate(view){
        this.$emit('navigate', view);
      },

      toggleDarkMode()
      {
        this.isDark = !this.isDark;

        document.documentElement.classList.toggle('my-app-dark');
      }
    }
  };
</script>
  
  <style scoped>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.1em;
    background-color: #333;
    color: #fff;
  }
  nav a {
    margin: 0 10px;
    color: #fff;
    text-decoration: none;
  }
  </style>
  