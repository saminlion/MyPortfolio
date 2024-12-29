<template>
    <section id="contact" class="contact-section">
      <h2>Contact</h2>
      <div class="contact-links">
        <p>
          LinkedIn: <a href="https://ca.linkedin.com/in/sa-min-hong-aab397108" target="_blank">LinkedIn Profile</a>
        </p>
        <p>
          Github: <a href="https://github.com/yourgithubprofile" target="_blank">Your Github Profile</a>
        </p>
      </div>
  
      <!-- 이메일 폼 -->
      <form @submit.prevent="sendEmail" class="contact-form">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="formData.name" required />
        </div>
        <div class="form-group">
          <label for="subject">Subject:</label>
          <input type="text" id="subject" v-model="formData.subject" required />
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" v-model="formData.message" required></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const formData = ref({
    name: '',
    subject: '',
    message: '',
  });
  
  function sendEmail() {
    const emailData = {
      to: 'swh5246@gmail.com',
      subject: formData.value.subject,
      body: `From: ${formData.value.name}\n\n${formData.value.message}`,
    };
  
    // 이메일 전송 로직 (여기선 POST 요청 사용 예제)
    fetch('https://your-backend-server/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    })
      .then((response) => {
        if (response.ok) {
          alert('Email sent successfully!');
          formData.value = { name: '', subject: '', message: '' }; // 폼 초기화
        } else {
          alert('Failed to send email. Please try again later.');
        }
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        alert('An error occurred. Please try again later.');
      });
  }
  </script>
  
  <style scoped>
  .contact-section {
    padding: 2rem;
    background: var(--background-color);
    color: var(--text-color);
  }
  
  .contact-links p {
    margin: 0.5rem 0;
  }
  
  .contact-links a {
    color: var(--link-color);
    text-decoration: none;
  }
  
  .contact-links a:hover {
    text-decoration: underline;
  }
  
  .contact-form {
    margin-top: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--button-border);
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: var(--button-background);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
  }
  
  button:hover {
    background: var(--button-hover-background);
    color: var(--button-hover-text);
  }
  </style>
  