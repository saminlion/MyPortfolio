<template>
    <section id="contact" class="contact-section">
        <h2>Contact</h2>
        <div class="contact-links">
            <p>
                Email:
                <a @click="copyEmail()" href="javascript:void(0)">swh5246@gmail.com</a>
                <Toast></Toast>
            </p>
            <p>
                LinkedIn:
                <a href="https://ca.linkedin.com/in/sa-min-hong-aab397108" target="_blank">Profile</a>
            </p>
            <p> Github:
                <a href="https://github.com/yourgithubprofile" target="_blank">Github</a>
            </p>
        </div>

        <!-- 간소화된 폼 -->
        <!-- <form @submit.prevent="sendEmail" class="contact-form">
            <div class="form-inline">
                <input type="text" v-model="formData.name" placeholder="Name" required />
                <input type="text" v-model="formData.subject" placeholder="Subject" required />
            </div>
            <textarea v-model="formData.message" placeholder="Message" required></textarea>
            <button type="submit">Send</button>
        </form> -->
    </section>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const formData = ref({
    name: '',
    subject: '',
    message: '',
});

function copyEmail() {
    const email = 'swh5246@gmail.com';
    navigator.clipboard
        .writeText(email)
        .then(() => {
            // 복사 성공 시 알림 표시
            console.log('Email copied to clipboard');
            showToast('success', 'Email Copied', 'The email address has been copied to your clipboard.');
        })
        .catch((error) => {
            console.error('Failed to copy email:', error);
            showToast('error', 'Copy Failed', 'Failed to copy the email address. Try again.');
        });
}

function showToast(severity, summary, detail) {
    toast.add({
        severity,
        summary,
        detail,
        life: 3000, // Toast 표시 시간
    });
}

// function sendEmail() {
//     const emailData = {
//         to: 'swh5246@gmail.com',
//         subject: formData.value.subject,
//         body: `From: ${formData.value.name}\n\n${formData.value.message}`,
//     };

//     fetch('https://your-backend-server/send-email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(emailData),
//     })
//         .then((response) => {
//             if (response.ok) {
//                 alert('Email sent successfully!');
//                 formData.value = { name: '', subject: '', message: '' };
//             } else {
//                 alert('Failed to send email. Please try again later.');
//             }
//         })
//         .catch((error) => {
//             console.error('Error sending email:', error);
//             alert('An error occurred. Please try again later.');
//         });
// }
</script>

<style scoped>
.contact-section {
    position: relative;
    padding: 2.0rem;
    text-align: center;
    background: var(--background-color);
    color: var(--text-color);
    height: 100%;
    width: 100%;
    top: 100%; /* 수직 중앙 정렬 */
  transform: translateY(-50%); /* 세로 중앙 보정 */
}

.contact-links p {
    font-size: 1rem;
    margin: 2rem 0;
    line-height: 1rem;
    /* 간격을 조정 */
}

.contact-links a {
    /* color: var(--link-color); */
    color: cyan;
    text-decoration: none;
    margin-right: 1rem;
    /* 오른쪽 간격 추가 */
}

.contact-form {
    margin-top: 1rem;
}

.form-inline {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

input,
textarea {
    padding: 0.5rem;
    border: 1px solid var(--button-border);
    border-radius: 4px;
    width: 100%;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

textarea {
    height: 80px;
    resize: none;
}

button {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

button:hover {
    background: var(--button-hover-background);
    color: var(--button-hover-text);
}
</style>