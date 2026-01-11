<template>
  <div class="hello" v-if="isConnectionReady">
    <div>{{ message }}</div>
    <h1>processId: {{ processId }}</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { io } from 'socket.io-client';

defineProps({
  message: { type: String, default: null },
});

const processId = ref('');
const isConnectionReady = ref(false);

const socket = io('ws://localhost:3000/', {
  withCredentials: true,
});

socket.on('connect', () => {
  isConnectionReady.value = true;
});

socket.on('processId', (pid) => {
  processId.value = pid;
});
</script>
