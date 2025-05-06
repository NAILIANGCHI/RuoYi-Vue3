<template>
  <div class="new-page" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
    <h1>新页面</h1>
    <button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">点击我</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { wbOrder } from '@/api/newApi';

const data = ref(null);

onMounted(async () => {
  try {
    const response = await wbOrder({ url: '/api/order', method: 'get' });
    data.value = response.data;
  } catch (error) {
    console.error('请求出错:', error);
  }
});
</script>

<style scoped>
.new-page {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #333;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

button {
  background-color: #28a745;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
}
</style>