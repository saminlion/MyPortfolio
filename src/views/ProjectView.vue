<template>
  <div class="project">
    <h2>{{ $t('project.title') }}</h2>

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
import unityDataKo from '@/data/ko/unity.json';
import unrealDataKo from '@/data/ko/unreal.json';
import etcDataKo from '@/data/ko/etc.json';
import unityDataJp from '@/data/jp/unity.json';
import unrealDataJp from '@/data/jp/unreal.json';
import etcDataJp from '@/data/jp/etc.json';
import unityDataEn from '@/data/en/unity.json';
import unrealDataEn from '@/data/en/unreal.json';
import etcDataEn from '@/data/en/etc.json';
import { useGlobalStore } from '@/store/globalStore';
import { ref, watch  } from 'vue';

export default {
  setup() {
    const globalStore = useGlobalStore();

    // 데이터 초기화
    const languageData = {
      ko: {
        unity: unityDataKo,
        unreal: unrealDataKo,
        etc: etcDataKo,
      },
      jp: {
        unity: unityDataJp,
        unreal: unrealDataJp,
        etc: etcDataJp,
      },
      en: {
        unity: unityDataEn,
        unreal: unrealDataEn,
        etc: etcDataEn,
      },
    };

    const unityProj = ref(languageData.ko.unity);
    const unrealProj = ref(languageData.ko.unreal);
    const etcProj = ref(languageData.ko.etc);

    const targetLan = ref(globalStore.language);

    // 언어 변경 시 데이터 업데이트
    const updateProjects = () => {
      if (languageData[targetLan.value]) {
        unityProj.value = languageData[targetLan.value].unity;
        unrealProj.value = languageData[targetLan.value].unreal;
        etcProj.value = languageData[targetLan.value].etc;
      } else {
        console.error("Invalid language selected:", targetLan.value);
      }
    };

    // 언어 변경 감시
    watch(targetLan, updateProjects);

    // 초기 업데이트
    updateProjects();

    return {
      unityProj,
      unrealProj,
      etcProj,
      targetLan,
    };
  },
  components: {
    ProjectList,
  },
};
</script>

<style scoped>
.project {
  margin: 1em 0;
}
</style>