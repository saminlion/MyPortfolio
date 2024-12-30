<template>
    <!-- About 섹션 -->
    <section id="about" class="about-section">
        <!-- About 제목 -->
        <h2>{{ $t('about.title') }}</h2>

        <!-- 탭 버튼 -->
        <div class="tab-buttons">
            <!-- 탭 버튼 반복 렌더링 -->
            <button 
                v-for="(tab, index) in tabs" 
                :key="index" 
                :class="{ active: activeTab === index }" 
                @click="activeTab = index">
                {{ tab.label }}
            </button>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="tab-content">
            <!-- 탭: 비전 -->
            <div v-show="activeTab === 0">
                <p>{{ $t('about.vision') }}</p>
            </div>

            <!-- 탭: 경험 -->
            <div v-show="activeTab === 1">
                <div class="beforeExp">
                    <!-- 이전 경험 -->
                    <h3>{{ $t('about.experience.before.title') }}</h3>
                    <p>{{ $t('about.experience.before.content') }}</p>
                </div>
                <Divider />
                <div class="afterExp">
                    <!-- 이후 경험 -->
                    <h3>{{ $t('about.experience.after.title') }}</h3>
                    <p>{{ $t('about.experience.after.content') }}</p>
                </div>
            </div>

            <!-- 탭: 성격 -->
            <div v-show="activeTab === 2">
                <p>{{ $t('about.personality.content') }}</p>
            </div>

            <!-- 탭: 경력 -->
            <div v-show="activeTab === 3">
                <ul>
                    <!-- 경력 리스트 반복 렌더링 -->
                    <li v-for="(item, index) in getItems('about.career.items')" :key="index">
                        <strong>{{ item.date }}</strong><br />
                        {{ item.title }}<br />
                        <!-- 설명이 배열인 경우 -->
                        <span v-if="Array.isArray(item.description)">
                            <ul>
                                <li v-for="(desc, i) in item.description" :key="i">{{ desc }}</li>
                            </ul>
                        </span>
                        <!-- 설명이 배열이 아닌 경우 -->
                        <span v-else>{{ item.description }}</span>
                        <Divider />
                    </li>
                </ul>
            </div>

            <!-- 탭: 교육 -->
            <div v-show="activeTab === 4">
                <ul>
                    <!-- 교육 리스트 반복 렌더링 -->
                    <li v-for="(item, index) in getItems('about.education.items')" :key="index">
                        <strong>{{ item.date }}</strong><br />
                        {{ item.title }}<br />
                        <!-- 설명이 배열인 경우 -->
                        <span v-if="Array.isArray(item.description)">
                            <ul>
                                <li v-for="(desc, i) in item.description" :key="i">{{ desc }}</li>
                            </ul>
                        </span>
                        <!-- 설명이 배열이 아닌 경우 -->
                        <span v-else>{{ item.description }}</span>
                        <Divider />
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'; // 다국어 지원 라이브러리
import { useGlobalStore } from '@/store/globalStore'; // 전역 상태 관리

// 다국어 번역 관련
const { t, tm, locale } = useI18n(); // `t`: 단일 문자열 번역, `tm`: 객체 데이터 번역
const globalStore = useGlobalStore(); // 전역 상태 참조

// 현재 활성화된 탭
const activeTab = ref(0);

// 언어 변경 감지 및 탭 레이블 업데이트
watch(locale, (newLocale) => {
    tabs.value = [
        { label: t('about.title') },
        { label: t('about.experience.title') },
        { label: t('about.personality.title') },
        { label: t('about.career.title') },
        { label: t('about.education.title') },
    ];
});

// 초기 탭 데이터 설정
const tabs = ref([
    { label: t('about.title') },
    { label: t('about.experience.title') },
    { label: t('about.personality.title') },
    { label: t('about.career.title') },
    { label: t('about.education.title') },
]);

// 번역된 데이터 리스트 가져오기
const getItems = (key) => {
    const items = tm(key, { returnObjects: true }); // 객체 형태로 데이터 반환
    return Array.isArray(items) ? items : []; // 배열인지 확인 후 반환
};

// 다크 모드 토글
const toggleDarkMode = () => {
    globalStore.isDark = !globalStore.isDark; // 다크 모드 상태 변경
    document.documentElement.classList.toggle('dark-mode', globalStore.isDark); // HTML 요소에 클래스 추가/제거
};
</script>

<style scoped>
/* About 섹션 전체 스타일 */
#about {
    padding: 2rem 1rem; /* 상하, 좌우 여백 */
    margin: 0 auto; /* 중앙 정렬 */
    text-align: center; /* 텍스트 가운데 정렬 */
}

/* 탭 버튼 영역 스타일 */
.tab-buttons {
    display: flex; /* 플렉스박스 사용 */
    justify-content: center; /* 버튼을 중앙 정렬 */
    gap: 1rem; /* 버튼 간 간격 */
    margin-bottom: 1.5rem; /* 아래쪽 여백 */
}

/* 개별 탭 버튼 스타일 */
.tab-buttons button {
    padding: 0.5rem 1rem; /* 버튼 안쪽 여백 */
    background: var(--button-background); /* 버튼 배경색 */
    color: var(--button-text); /* 버튼 텍스트 색상 */
    border: 1px solid var(--button-border); /* 버튼 테두리 색상 */
    border-radius: 4px; /* 둥근 모서리 */
    font-size: 1rem; /* 버튼 텍스트 크기 */
    cursor: pointer; /* 클릭 가능한 포인터 표시 */
    transition: background 0.3s, color 0.3s; /* 부드러운 전환 효과 */
}

/* 활성화된 탭 버튼 스타일 */
.tab-buttons button.active {
    background: var(--link-hover-color); /* 활성화 상태의 배경색 */
    color: #fff; /* 활성화 상태의 텍스트 색상 */
}

/* 버튼 호버 스타일 */
.tab-buttons button:hover {
    background: var(--button-hover-background); /* 호버 시 배경색 */
    color: var(--button-hover-text); /* 호버 시 텍스트 색상 */
}

/* 탭 콘텐츠 영역 스타일 */
.tab-content {
    background: var(--button-background); /* 콘텐츠 배경색 */
    color: var(--text-color); /* 텍스트 색상 */
    border-radius: 8px; /* 둥근 모서리 */
    padding: 1.5rem; /* 콘텐츠 안쪽 여백 */
    max-width: 700px; /* 콘텐츠 최대 너비 */
    margin: 0 auto; /* 콘텐츠 중앙 정렬 */
    text-align: left; /* 텍스트 왼쪽 정렬 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
    line-height: 1.8rem; /* 줄 간격 */
}
</style>
