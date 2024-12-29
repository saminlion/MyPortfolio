<template>
    <section id="skills">
        <h2>{{ $t('skill.title') }}</h2>

        <Accordion value="0">
            <AccordionPanel value="0">
                <AccordionHeader> {{ $t('skill.program') }} </AccordionHeader>
                <AccordionContent>
                    <ul>
                        <li v-for="programing in programings.value" :key="programing">
                            <MeterGroup :value="programing" label-position="start"></MeterGroup>
                            <Divider />
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionPanel>

            <AccordionPanel value="1">
                <AccordionHeader> {{ $t('skill.coop') }} </AccordionHeader>
                <AccordionContent>
                    <ul>
                        <li v-for="coop in coops.value" :key="coop">
                            <MeterGroup :value="coop" label-position="start"></MeterGroup>
                            <Divider />
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionPanel>

            <AccordionPanel value="2">
                <AccordionHeader> {{ $t('skill.etc') }} </AccordionHeader>
                <AccordionContent>
                    <ul>
                        <li v-for="language in languages.value" :key="language">
                            <MeterGroup :value="language" label-position="start"></MeterGroup>
                            <Divider />
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </section>
</template>

<script setup>

const programings = ref([[{ label: "C++", color: '#00599C', value: 80 }],
[{ label: "C#", color: '#68217A', value: 84 }],
[{ label: "Unity", color: '#708090', value: 84 }],
[{ label: "Unreal Engine", color: '#444B6E', value: 80 }],
[{ label: "JavaScript", color: '#F7DF1E', value: 70 }],
[{ label: "Vue.js", color: '#42B883', value: 60 }]]);

const coops = ref([[{ label: "Slack", color: '#36C5F0', value: 70 }],
[{ label: "TortoiseSVN", color: '#734F96', value: 84 }],
[{ label: "Github", color: '#333333', value: 84 }],
[{ label: "Naver Works", color: '#1EC800', value: 80 }]]);

const languages = ref([[{ label: "日本語", color: '#FF4B4B', value: 80 }],
[{ label: "English", color: '#1E90FF', value: 85 }]]);

</script>