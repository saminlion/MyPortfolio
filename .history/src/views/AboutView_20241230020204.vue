<template>
  <section id="about">
    <h2>{{ $t('about.title') }}</h2>

    <Accordion value="0">
      <AccordionPanel value="0">
        <AccordionHeader> {{ $t('about.value1') }} </AccordionHeader>
        <AccordionContent>
          <p>
            {{ $t('about.vision') }}
          </p>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader> {{ $t('about.experience.title') }} </AccordionHeader>
        <AccordionContent>
          <div class="beforeExp">
            <h3> {{ $t('about.experience.before.title') }} </h3>

            <p> {{ $t('about.experience.before.content') }} </p>

          </div>

          <Divider />

          <div class="afterExp">
            <h3> {{ $t('about.experience.after.title') }} </h3>

            <p> {{ $t('about.experience.after.content') }} </p>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="2">
        <AccordionHeader> {{ $t('about.personality.title') }} </AccordionHeader>
        <AccordionContent>
          <p>{{ $t('about.personality.content') }}</p>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="3">
        <AccordionHeader> {{ $t('about.career.title') }} </AccordionHeader>
        <AccordionContent>
          <ul style="margin-top:0">
            <li v-for="(item, index) in getItems('about.career.items')" :key="index">
              <strong>{{ item.date }}</strong><br />
              {{ item.title }}<br />
              <span v-if="Array.isArray(item.description)">
                <ul>
                  <li v-for="(desc, i) in item.description" :key="i">
                    {{ desc }}
                  </li>
                </ul>
              </span>
              <span v-else>{{ item.description }}</span>
              <Divider />
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="4">
        <AccordionHeader>{{ $t('about.education.title') }}</AccordionHeader>
        <AccordionContent>
          
          <li v-for="(item, index) in getItems('about.education.items')" :key="index">
              <strong>{{ item.date }}</strong><br />
              {{ item.title }}<br />
              <span v-if="Array.isArray(item.description)">
                <ul>
                  <li v-for="(desc, i) in item.description" :key="i">
                    {{ desc }}
                  </li>
                </ul>
              </span>
              <span v-else>{{ item.description }}</span>
              <Divider />
            </li>
        </AccordionContent>
      </AccordionPanel>

    </Accordion>
  </section>
</template>

<script>
import { useGlobalStore } from '@/store/globalStore';
import { translateText } from '@/utils/translator';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const globalStore = useGlobalStore();

    return {
      targetLan: globalStore.language,
      translateText: ""
    }
  },

  methods: {

    async translateText(inputText) {
      try {
        this.translatedText = await translateText(inputText, this.targetLan);

      }
      catch (error) {
        console.error("Trans Error:", error);
      }
    },

    getItems(key) {
      const { tm } = useI18n(); // t: 기본 번역, tm: 메시지 병합

      // 'about.career.items' 키에서 데이터를 가져옵니다.
      const items = tm(key, { returnObjects: true });

      // 데이터가 배열 형태인지 확인
      if (!Array.isArray(items)) {
        console.error('Career Items is not an array:', items);
        return [];
      }

      //console.log('Career Items:', items); // 디버깅용
      return items;
    }
  

  },
}

</script>

<style scoped>
#about {
  padding: 0em 0;
}

p {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  line-height: 2.0;
  word-wrap: break-word;
  text-align: justify;
  margin: 0;
}

h3 {
  margin-top: 0;
  margin-bottom: 1;
}

li {
  line-height: 30px;
}
</style>