<template>
  <div class="dashboard">
    <!-- 页头 -->
    <el-page-header content="仪表盘" class="page-header" />

    <!-- 快捷统计信息 -->
    <el-row gutter="20" class="stats">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="40">{{ stat.icon }}</el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表部分 -->
    <el-row gutter="20" class="charts">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <ECharts :option="lineChartOption" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <ECharts :option="pieChartOption" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import * as echarts from "echarts";
import { TrendCharts, Money, UserFilled, Document } from "@element-plus/icons-vue";
import ECharts from "vue-echarts";

export default defineComponent({
  name: "Dashboard",
  components: {
    ECharts, // vue-echarts
  },
  setup() {
    const stats = [
      { title: "总收入", value: "¥100,000", icon: Money, color: "#67C23A" },
      { title: "用户数", value: "2,345", icon: UserFilled, color: "#409EFF" },
      { title: "订单量", value: "1,234", icon: Document, color: "#E6A23C" },
      { title: "访问量", value: "12,345", icon: TrendCharts, color: "#F56C6C" },
    ];

    const lineChartOption = {
      title: { text: "访问量趋势", left: "center" },
      xAxis: { type: "category", data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] },
      yAxis: { type: "value" },
      series: [{ data: [820, 932, 901, 934, 1290, 1330, 1320], type: "line", smooth: true }],
      grid: { left: '10%', right: '10%', top: '15%', bottom: '10%' },
    };

    const pieChartOption = {
      title: { text: "订单来源", left: "center" },
      tooltip: { trigger: "item" },
      series: [
        {
          name: "来源",
          type: "pie",
          radius: "50%",
          data: [
            { value: 1048, name: "搜索引擎" },
            { value: 735, name: "直接访问" },
            { value: 580, name: "邮件营销" },
            { value: 484, name: "联盟广告" },
            { value: 300, name: "视频广告" },
          ],
        },
      ],
      grid: { left: '10%', right: '10%', top: '15%', bottom: '10%' },
    };

    return { stats, lineChartOption, pieChartOption };
  },
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.stats {
  margin-bottom: 20px;
}

.stat-card {
  transition: transform 0.3s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: #fff;
  margin-right: 10px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #999;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-card {
  transition: transform 0.3s ease-in-out;
}

.chart-card:hover {
  transform: translateY(-5px);
}
</style>
