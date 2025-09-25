<template>
  <div class="app-container">
    <div class="dashboard-header">
      <h3>服务监控中心</h3>
      <div class="update-info">
        <span>最后更新: {{ lastUpdateTime }}</span>
        <el-button type="primary" size="small" @click="refreshData">
          <Refresh style="width: 16px; height: 16px;" />
          立即刷新
        </el-button>
      </div>
    </div>
    
    <!-- 状态卡片区域 -->
    <div class="status-cards">
      <el-card class="status-card" :class="getCpuStatusClass()">
        <div class="status-card-content">
          <div class="status-icon">
            <Cpu style="width: 24px; height: 24px;" />
          </div>
          <div class="status-info">
            <div class="status-title">CPU使用率</div>
            <div class="status-value" v-if="server.cpu">{{ server.cpu.used }}%</div>
          </div>
          <div class="status-detail" v-if="server.cpu">
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: server.cpu.used + '%' }"></div>
            </div>
            <div class="status-label">
              <span>用户: {{ server.cpu.used }}%</span>
              <span>系统: {{ server.cpu.sys }}%</span>
              <span>空闲: {{ server.cpu.free }}%</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" :class="getMemStatusClass()">
        <div class="status-card-content">
          <div class="status-icon">
            <Tickets style="width: 24px; height: 24px;" />
          </div>
          <div class="status-info">
            <div class="status-title">内存使用率</div>
            <div class="status-value" v-if="server.mem">{{ server.mem.usage }}%</div>
          </div>
          <div class="status-detail" v-if="server.mem">
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: server.mem.usage + '%' }"></div>
            </div>
            <div class="status-label">
              <span>已用: {{ server.mem.used }}G</span>
              <span>总: {{ server.mem.total }}G</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" :class="getJvmStatusClass()">
        <div class="status-card-content">
          <div class="status-icon">
            <CoffeeCup style="width: 24px; height: 24px;" />
          </div>
          <div class="status-info">
            <div class="status-title">JVM使用率</div>
            <div class="status-value" v-if="server.jvm">{{ server.jvm.usage }}%</div>
          </div>
          <div class="status-detail" v-if="server.jvm">
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: server.jvm.usage + '%' }"></div>
            </div>
            <div class="status-label">
              <span>已用: {{ server.jvm.used }}M</span>
              <span>总: {{ server.jvm.total }}M</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <Cpu style="width: 16px; height: 16px;" />
              <span>CPU使用趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <VChart ref="cpuChartRef" :option="cpuChartOption" style="width: 100%; height: 300px;" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <Tickets style="width: 16px; height: 16px;" />
              <span>内存使用趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <VChart ref="memChartRef" :option="memChartOption" style="width: 100%; height: 300px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息区域 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <Monitor style="width: 16px; height: 16px;" />
              <span>服务器信息</span>
            </div>
          </template>
          <div class="info-content">
            <el-row :gutter="10">
              <el-col :span="6">
                <div class="info-item">
                  <label>服务器名称:</label>
                  <span v-if="server.sys">{{ server.sys.computerName }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>服务器IP:</label>
                  <span v-if="server.sys">{{ server.sys.computerIp }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>操作系统:</label>
                  <span v-if="server.sys">{{ server.sys.osName }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>系统架构:</label>
                  <span v-if="server.sys">{{ server.sys.osArch }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <CoffeeCup style="width: 16px; height: 16px;" />
              <span>Java虚拟机信息</span>
            </div>
          </template>
          <div class="info-content">
            <el-row :gutter="10">
              <el-col :span="12">
                <div class="info-item">
                  <label>Java版本:</label>
                  <span v-if="server.jvm">{{ server.jvm.version }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>启动时间:</label>
                  <span v-if="server.jvm">{{ server.jvm.startTime }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>运行时长:</label>
                  <span v-if="server.jvm">{{ server.jvm.runTime }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>核心数:</label>
                  <span v-if="server.cpu">{{ server.cpu.cpuNum }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <MessageBox style="width: 16px; height: 16px;" />
              <span>磁盘状态</span>
            </div>
          </template>
          <div class="info-content">
            <el-table v-if="server.sysFiles" :data="server.sysFiles" size="small" :show-header="false">
              <el-table-column prop="dirName" label="路径" width="60" />
              <el-table-column prop="usage" label="使用率" width="80">
                <template #default="scope">
                  <div class="disk-usage">
                    <div class="disk-usage-bar">
                      <div class="disk-usage-fill" :style="{ width: scope.row.usage + '%' }" :class="getDiskStatusClass(scope.row.usage)"></div>
                    </div>
                    <span>{{ scope.row.usage }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="used" label="已用" width="80" />
              <el-table-column prop="free" label="可用" width="80" />
              <el-table-column prop="total" label="总计" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Cpu, Tickets, CoffeeCup, Monitor, MessageBox, Refresh } from '@element-plus/icons-vue';
import { getServer } from '@/api/monitor/server';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import {
  LineChart,
  BarChart,
  PieChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer
]);

const server = ref([]);
const lastUpdateTime = ref('');
const updateInterval = ref(null);
const cpuChartRef = ref(null);
const memChartRef = ref(null);
const cpuHistoryData = ref([]);
const memHistoryData = ref([]);
const timeLabels = ref([]);

// CPU图表配置
const cpuChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['用户使用率', '系统使用率']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: timeLabels.value
    }
  ],
  yAxis: [
    {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: [
    {
      name: '用户使用率',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      smooth: true,
      lineStyle: {
        width: 2
      },
      data: cpuHistoryData.value.map(item => item.user)
    },
    {
      name: '系统使用率',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      smooth: true,
      lineStyle: {
        width: 2
      },
      data: cpuHistoryData.value.map(item => item.system)
    }
  ],
  color: ['#409eff', '#67c23a']
}));

// 内存图表配置
const memChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['内存使用率', 'JVM使用率']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: timeLabels.value
    }
  ],
  yAxis: [
    {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: [
    {
      name: '内存使用率',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      smooth: true,
      lineStyle: {
        width: 2
      },
      data: memHistoryData.value.map(item => item.mem)
    },
    {
      name: 'JVM使用率',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      smooth: true,
      lineStyle: {
        width: 2
      },
      data: memHistoryData.value.map(item => item.jvm)
    }
  ],
  color: ['#e6a23c', '#f56c6c']
}));

// 获取服务器状态数据
function getList() {
  getServer().then(response => {
    server.value = response.data;
    updateLastTime();
    updateHistoryData();
  }).catch(error => {
    console.error('获取服务器数据失败:', error);
  });
}

// 更新最后更新时间
function updateLastTime() {
  const now = new Date();
  lastUpdateTime.value = now.toLocaleTimeString();
}

// 更新历史数据
function updateHistoryData() {
  const now = new Date();
  const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
  
  // 限制数据点数量
  if (timeLabels.value.length >= 30) {
    timeLabels.value.shift();
    cpuHistoryData.value.shift();
    memHistoryData.value.shift();
  }
  
  timeLabels.value.push(timeLabel);
  
  if (server.value.cpu) {
    cpuHistoryData.value.push({
      user: server.value.cpu.used,
      system: server.value.cpu.sys
    });
  }
  
  if (server.value.mem && server.value.jvm) {
    memHistoryData.value.push({
      mem: server.value.mem.usage,
      jvm: server.value.jvm.usage
    });
  }
}

// 立即刷新数据
function refreshData() {
  getList();
}

// 获取CPU状态样式类
function getCpuStatusClass() {
  if (!server.value.cpu) return '';
  const usage = server.value.cpu.used;
  if (usage > 80) return 'status-danger';
  if (usage > 60) return 'status-warning';
  return 'status-normal';
}

// 获取内存状态样式类
function getMemStatusClass() {
  if (!server.value.mem) return '';
  const usage = server.value.mem.usage;
  if (usage > 80) return 'status-danger';
  if (usage > 60) return 'status-warning';
  return 'status-normal';
}

// 获取JVM状态样式类
function getJvmStatusClass() {
  if (!server.value.jvm) return '';
  const usage = server.value.jvm.usage;
  if (usage > 80) return 'status-danger';
  if (usage > 60) return 'status-warning';
  return 'status-normal';
}

// 获取磁盘状态样式类
function getDiskStatusClass(usage) {
  if (usage > 80) return 'disk-danger';
  if (usage > 60) return 'disk-warning';
  return 'disk-normal';
}

// 组件挂载时启动定时器
onMounted(() => {
  getList();
  // 每5秒更新一次数据
  updateInterval.value = setInterval(() => {
    getList();
  }, 5000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.dashboard-header h3 {
  margin: 0;
  color: #303133;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.status-card {
  flex: 1;
  transition: all 0.3s ease;
}

.status-card-content {
  padding: 15px;
}

.status-icon {
  float: right;
  opacity: 0.6;
}

.status-info {
  margin-bottom: 10px;
}

.status-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.status-bar {
  height: 6px;
  background-color: #ecf5ff;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.status-bar-fill {
  height: 100%;
  background-color: #409eff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.status-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.status-label span {
  white-space: nowrap;
}

.status-danger .status-bar-fill {
  background-color: #f56c6c;
}

.status-warning .status-bar-fill {
  background-color: #e6a23c;
}

.status-normal .status-bar-fill {
  background-color: #67c23a;
}

.chart-card,
.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.chart-container {
  padding: 10px 0;
}

.info-content {
  padding: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 10px;
  min-width: 80px;
}

.info-item span {
  color: #303133;
}

.disk-usage {
  display: flex;
  align-items: center;
  gap: 5px;
}

.disk-usage-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.disk-usage-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.disk-danger {
  background-color: #f56c6c;
}

.disk-warning {
  background-color: #e6a23c;
}

.disk-normal {
  background-color: #67c23a;
}

@media screen and (max-width: 768px) {
  .status-cards {
    flex-direction: column;
  }
  
  .el-row > .el-col {
    width: 100%;
  }
}
</style>
