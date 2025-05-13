<template>
  <div class="new-page" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
    <h1>多平台订单处理</h1>

    <!-- Wildberries 订单处理 -->
    <div class="task-container">
      <button
          @click="handleWbOrder"
          :disabled="wb.loading"
          class="task-button"
          :style="{ backgroundColor: wb.loading ? '#6c757d' : '#8a2be2' }"
      >
        {{ wb.loading ? 'Wildberries处理中...' : '获取Wildberries订单' }}
      </button>
      <div v-if="wb.filePath" class="file-link">
        <a :href="wb.filePath" target="_blank" download>下载Wildberries订单文件</a>
      </div>
    </div>

    <!-- Ozon 订单处理 -->
    <div class="task-container">
      <button
          @click="handleOzonOrder"
          :disabled="ozon.loading"
          class="task-button"
          :style="{ backgroundColor: ozon.loading ? '#6c757d' : '#FF6600' }"
      >
        {{ ozon.loading ? 'Ozon处理中...' : '获取Ozon订单' }}
      </button>
      <div v-if="ozon.filePath" class="file-link">
        <a :href="ozon.filePath" target="_blank" download>下载Ozon订单文件</a>
      </div>
    </div>

    <!-- Yandex 订单处理 -->
    <div class="task-container">
      <button
          @click="handleYandexOrder"
          :disabled="yandex.loading"
          class="task-button"
          :style="{ backgroundColor: yandex.loading ? '#6c757d' : '#FFCC00', color: yandex.loading ? '#fff' : '#000' }"
      >
        {{ yandex.loading ? 'Yandex处理中...' : '获取Yandex订单' }}
      </button>
      <div v-if="yandex.filePath" class="file-link">
        <a :href="yandex.filePath" target="_blank" download>导出Yandex订单文件</a>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { wbOrder } from '@/api/newApi';
import { ozonOrder } from '@/api/newApi'; // 假设已添加
import { yandexOrder } from '@/api/newApi'; // 假设已添加

// Wildberries 状态
const wb = ref({
  loading: false,
  filePath: null
});

// Ozon 状态
const ozon = ref({
  loading: false,
  filePath: null
});

// Yandex 状态
const yandex = ref({
  loading: false,
  filePath: null
});

const errorMessage = ref(null);

// 处理Wildberries订单
const handleWbOrder = async () => {
  wb.value.loading = true;
  errorMessage.value = null;

  try {
    const response = await wbOrder({
      url: '/api/wb/order',
      method: 'get',
      timeout: 60000 // 设置60秒超时
    });

    if (response.data.filePath) {
      wb.value.filePath = response.data.filePath;
    } else {
      throw new Error('未返回有效文件路径');
    }
  } catch (error) {
    console.error('Wildberries订单获取失败:', error);
    errorMessage.value = `Wildberries订单获取失败: ${error.message}`;
  } finally {
    wb.value.loading = false;
  }
};

// 处理Ozon订单
const handleOzonOrder = async () => {
  ozon.value.loading = true;
  errorMessage.value = null;

  try {
    const response = await ozonOrder({
      url: '/api/ozon/order',
      method: 'get',
      timeout: 60000
    });

    if (response.data.filePath) {
      ozon.value.filePath = response.data.filePath;
    } else {
      throw new Error('未返回有效文件路径');
    }
  } catch (error) {
    console.error('Ozon订单获取失败:', error);
    errorMessage.value = `Ozon订单获取失败: ${error.message}`;
  } finally {
    ozon.value.loading = false;
  }
};

//处理Yandex订单
const handleYandexOrder = async () => {
  yandex.value.loading = true;
  errorMessage.value = null;

  try {
    const response = await yandexOrder({
      url: '/api/yandex/order',
      method: 'get',
      timeout: 60000
    });

    if (response.data.filePath) {
      yandex.value.filePath = response.data.filePath;
    } else {
      throw new Error('未返回有效文件路径');
    }
  } catch (error) {
    console.error('Yandex订单获取失败:', error);
    errorMessage.value = `Yandex订单获取失败: ${error.message}`;
  } finally {
    yandex.value.loading = false;
  }
};
</script>

<style scoped>
.new-page {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

h1 {
  color: #333;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.task-container {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.task-button {
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 10px;
  font-weight: bold;
}

.task-button:hover:not(:disabled) {
  opacity: 0.9;
}

.task-button:disabled {
  cursor: not-allowed;
}

.file-link {
  margin-top: 10px;
}

.file-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.file-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  max-width: 400px;
  text-align: center;
}
</style>
