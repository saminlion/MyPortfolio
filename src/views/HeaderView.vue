<template>
    <header>
      <h1>My Game Developer Portfolio</h1>
      <nav>
        <a href="#" @click.prevent="navigate('about')">About</a>
        <a href="#" @click.prevent="navigate('projects')">Projects</a>
        <a href="#" @click.prevent="navigate('skills')">Skills</a>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    methods:{
      navigate(view){
        this.$emit('navigate', view);
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
  