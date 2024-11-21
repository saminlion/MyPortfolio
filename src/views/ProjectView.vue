<template>
 <div class="project">
    <h2>Projects</h2>

    <Accordion value="3">
      <AccordionPanel value="0">
        <AccordionHeader>Unity + {{ unityProj.length }}</AccordionHeader>
        <AccordionContent>
          <project-list :projects="unityProj"></project-list>
        </AccordionContent>         
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>Unreal + {{ unrealProj.length }}</AccordionHeader>
        <AccordionContent>
          <project-list :projects="unrealProj"></project-list>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="2">
        <AccordionHeader>ETC + {{ etcProj.length }}</AccordionHeader>
        <AccordionContent>
          <project-list :projects="etcProj"></project-list>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script>


import ProjectList from '../components/Project/ProjectList.vue'
import unityData from '@/data/unity.json';
import unrealData from '@/data/unreal.json';
import etcData from '@/data/etc.json';

export default {
  components: {
    ProjectList
  },
  data() {
    return {
      unityProj: unityData,
      unrealProj: unrealData,
      etcProj: etcData
    };
  },
  mounted() {
    console.log("ProjectPage mounted - projects:", this.unityProj); // 디버깅용 출력
  }
};
</script>

<style scoped>
.project {
  margin: 1em 0;
}
</style>