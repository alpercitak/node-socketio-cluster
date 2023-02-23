<template>
  <div class="hello" v-if="isConnectionReady">
    <div>Message</div>
    <h1>processId: {{ processId }}</h1>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {io} from 'socket.io-client';

let processId = ref('');
let isConnectionReady = ref(false);

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
