<template>
  <section id="skills">
    <h2>Skills</h2>

    <Accordion value="0">
      <AccordionPanel value="0">
        <AccordionHeader> 프로그래밍 관련 </AccordionHeader>
        <AccordionContent>
          <ul>
            <li v-for="programing in programings" :key="programing">
              <MeterGroup :value="programing" label-position="start"></MeterGroup>
              <Divider />
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader> 협업 관련 </AccordionHeader>
        <AccordionContent>
          <ul>
            <li v-for="coop in coops" :key="coop">
              <MeterGroup :value="coop" label-position="start"></MeterGroup>
              <Divider />
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="2">
        <AccordionHeader> 기타 관련 </AccordionHeader>
        <AccordionContent>
          <ul>
            <li v-for="language in languages" :key="language">
              <MeterGroup :value="language" label-position="start"></MeterGroup>
              <Divider />
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>

    </Accordion>


  </section>
</template>

<script>

export default {
  data() {
    return {
      programings: [[{ label: "C++", color: '#00599C', value: 80 }],
      [{ label: "C#", color: '#68217A', value: 84 }],
      [{ label: "Unity", color: '#708090', value: 84 }],
      [{ label: "Unreal Engine", color: '#444B6E', value: 80 }],
      [{ label: "JavaScript", color: '#F7DF1E', value: 70 }],
      [{ label: "Vue.js", color: '#42B883', value: 60 }]],

      coops: [[{ label: "Slack", color: '#36C5F0', value: 70 }],
      [{ label: "TortoiseSVN", color: '#734F96', value: 84 }],
      [{ label: "Github", color: '#333333', value: 84 }],
      [{ label: "Naver Works", color: '#1EC800', value: 80 }]],

      languages: [[{ label: "일본어", color: '#FF4B4B', value: 80 }],
      [{ label: "영어", color: '#1E90FF', value: 85 }]],
    };
  }
};
</script>

<style scoped>
#skills {
  padding: 10px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>