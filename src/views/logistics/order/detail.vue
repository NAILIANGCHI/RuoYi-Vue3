<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ orderInfo.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="orderInfo.status === '1' ? 'success' : 'info'">
            {{ orderInfo.status === '1' ? '已发货' : '待发货' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发货人">{{ orderInfo.senderName }}</el-descriptions-item>
        <el-descriptions-item label="发货人电话">{{ orderInfo.senderPhone }}</el-descriptions-item>
        <el-descriptions-item label="发货地址" :span="2">{{ orderInfo.senderAddress }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ orderInfo.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="收货人电话">{{ orderInfo.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ orderInfo.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="货物名称">{{ orderInfo.cargoName }}</el-descriptions-item>
        <el-descriptions-item label="货物重量">{{ orderInfo.cargoWeight }}kg</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ orderInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ orderInfo.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrder } from '@/api/logistics/order'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const orderInfo = ref({})
const loading = ref(true)

// 获取订单详情
const getOrderInfo = async () => {
  try {
    const orderId = route.params.id
    if (!orderId) {
      proxy.$modal.msgError('订单ID不能为空')
      router.push('/logistics/order')
      return
    }
    
    const res = await getOrder(orderId)
    if (res.code === 200) {
      orderInfo.value = res.data
    } else {
      proxy.$modal.msgError(res.msg || '获取订单详情失败')
      router.push('/logistics/order')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    proxy.$modal.msgError('获取订单详情失败')
    router.push('/logistics/order')
  } finally {
    loading.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.push('/logistics/order')
}

onMounted(() => {
  getOrderInfo()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 