<script setup>
//import { ref } from 'vue'

const welcomeMessage = 'Welcome to Skala-Vue'
</script>

<template>
  <div class="practice-section">
    <h2>{{ welcomeMessage }}</h2>
    <p>{{ welcomeMessage.toUpperCase() }}</p>
    <p>{{ 'Random number: ' + Math.round(Math.random() * 100) }}</p>
  </div>                  <!-- round로 반올림 -->
</template>
