<template>
    <section id="contact" class="contact-section">
      <h2>Contact</h2>
      <div class="contact-links">
        <p>
          Email: <a href="mailto:swh5246@gmail.com">swh5246@gmail.com</a> | 
          LinkedIn: <a href="https://ca.linkedin.com/in/sa-min-hong-aab397108" target="_blank">Profile</a> | 
          Github: <a href="https://github.com/yourgithubprofile" target="_blank">Github</a>
        </p>
      </div>
  
      <!-- 간소화된 폼 -->
      <form @submit.prevent="sendEmail" class="contact-form">
        <div class="form-inline">
          <input type="text" v-model="formData.name" placeholder="Name" required />
          <input type="text" v-model="formData.subject" placeholder="Subject" required />
        </div>
        <textarea v-model="formData.message" placeholder="Message" required></textarea>
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
  
    fetch('https://your-backend-server/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    })
      .then((response) => {
        if (response.ok) {
          alert('Email sent successfully!');
          formData.value = { name: '', subject: '', message: '' };
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
    padding: 3.0rem;
    text-align: center;
    background: var(--background-color);
    color: var(--text-color);
    margin: 4 auto;
  }
  
  .contact-links p {
    font-size: 0.9rem;
    margin: 1rem 1;
  }
  
  .contact-links a {
    color: var(--link-color);
    text-decoration: none;
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
  