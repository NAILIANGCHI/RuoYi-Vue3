<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
<!--      <el-form-item label="客户代码" prop="customerCode">-->
<!--        <el-input-->
<!--            v-model="queryParams.customerCode"-->
<!--            placeholder="请输入客户代码"-->
<!--            clearable-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="入库单号" prop="warehousingNumber">
        <el-input
            v-model="queryParams.warehousingNumber"
            placeholder="请输入入库单号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="订单状态" prop="orderStatus">-->
<!--        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>-->
<!--          <el-option label="已完成" value="completed" />-->
<!--          <el-option label="进行中" value="inProgress" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="创建时间" style="width: 308px">-->
<!--        <el-date-picker-->
<!--            v-model="daterangeCreateTime"-->
<!--            value-format="YYYY-MM-DD"-->
<!--            type="daterange"-->
<!--            range-separator="-"-->
<!--            start-placeholder="开始日期"-->
<!--            end-placeholder="结束日期"-->
<!--            @change="handleDateChange"-->
<!--        ></el-date-picker>-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    &lt;!&ndash; 数据表格 &ndash;&gt;-->
<!--    <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange" border>-->
<!--      <el-table-column type="selection" width="55" align="center" />-->
<!--      <el-table-column type="index" label="序号" width="50" align="center" />-->
<!--      <el-table-column label="客户代码" align="center" prop="customerCode" />-->
<!--      <el-table-column label="物流模式" align="center" prop="logisticsMode" />-->
<!--      <el-table-column label="入库单号" align="center" prop="warehousingNumber" />-->
<!--      <el-table-column label="订单状态" align="center" prop="orderStatus" />-->
<!--      <el-table-column label="负责人" align="center" prop="principal" />-->
<!--      <el-table-column label="发货时间" align="center" prop="sellerShipmentDate" />-->
<!--      <el-table-column label="费用合计" align="center" prop="customerInitialBillingTotal" />-->
<!--      <el-table-column label="操作" align="center">-->
<!--        <template #default="scope">-->
<!--          <el-button link type="primary" @click="handleOpenDetail(scope.row)">查看详情</el-button>-->
<!--          <el-button link type="primary" @click="postRobot(scope.row)" v-hasPermi="['wps:check']">导出账单</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column label="客户代码" align="center" prop="customerCode" />
      <el-table-column label="物流模式" align="center" prop="logisticsMode" />
      <el-table-column label="入库单号" align="center" prop="warehousingNumber" />
      <el-table-column label="订单状态" align="center" prop="orderStatus" />
      <el-table-column label="负责人" align="center" prop="principal" />
      <el-table-column label="发货时间" align="center" prop="sellerShipmentDate" />
      <el-table-column label="费用合计" align="center" prop="customerInitialBillingTotal" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleOpenDetail(scope.row)">查看详情</el-button>
          <el-button link type="primary" @click="postRobot(scope.row)" v-hasPermi="['wps:check']">导出账单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-show="totalRecords > 0"
        :total="totalRecords"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="handlePageChange"
    />

    <el-dialog v-model="isModalVisible" title="详细信息" width="800px" append-to-body>
      <el-descriptions border column="2">
        <!-- 基本信息 -->
        <el-descriptions-item label="序号">{{ selectedItem.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="客户代码">{{ selectedItem.customerCode }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ selectedItem.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户类型">{{ selectedItem.customerType }}</el-descriptions-item>
        <el-descriptions-item label="物流模式">{{ selectedItem.logisticsMode }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ selectedItem.orderStatus }}</el-descriptions-item>

        <!-- 时间节点 -->
        <el-descriptions-item label="卖家发货日期">{{ selectedItem.sellerShipmentDate }}</el-descriptions-item>
        <el-descriptions-item label="中转仓入库日期">{{ selectedItem.transferWarehouseInDate }}</el-descriptions-item>
        <el-descriptions-item label="中转发运日期">{{ selectedItem.transferDispatchDate }}</el-descriptions-item>
        <el-descriptions-item label="莫斯科提货日期">{{ selectedItem.moscowPickupDate }}</el-descriptions-item>
        <el-descriptions-item label="海外仓入库日期">{{ selectedItem.overseasWarehouseInDate }}</el-descriptions-item>
        <el-descriptions-item label="客户付款日期">{{ selectedItem.customerPaymentDate }}</el-descriptions-item>

        <!-- 物流单号 -->
        <el-descriptions-item label="客户交货物流单号">{{ selectedItem.customerDeliveryTrackingNumber }}</el-descriptions-item>
        <el-descriptions-item label="承运商物流单号">{{ selectedItem.carrierTrackingNumber }}</el-descriptions-item>
        <el-descriptions-item label="入库单号">{{ selectedItem.warehousingNumber }}</el-descriptions-item>

        <!-- 客户信息 -->
        <el-descriptions-item label="负责人">{{ selectedItem.principal }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ selectedItem.productName }}</el-descriptions-item>
        <el-descriptions-item label="品类">{{ selectedItem.category }}</el-descriptions-item>

        <!-- 货物信息 -->
        <el-descriptions-item label="货值">{{ selectedItem.value }}</el-descriptions-item>
        <el-descriptions-item label="SKU总数">{{ selectedItem.skuTotalCount }}</el-descriptions-item>
        <el-descriptions-item label="箱数">{{ selectedItem.boxCount }}</el-descriptions-item>
        <el-descriptions-item label="客户包装总重量 (kg)">{{ selectedItem.customerPackagingTotalWeight }}</el-descriptions-item>
        <el-descriptions-item label="客户包装总方数 (m³)">{{ selectedItem.customerPackagingTotalVolume }}</el-descriptions-item>
        <el-descriptions-item label="原缠后总重量 (kg)">{{ selectedItem.originalWeightAfterWrapping }}</el-descriptions-item>
        <el-descriptions-item label="原缠后总方数 (m³)">{{ selectedItem.originalVolumeAfterWrapping }}</el-descriptions-item>
        <el-descriptions-item label="密度（原缠后）">{{ selectedItem.densityAfterWrapping }}</el-descriptions-item>

        <!-- 费用信息 -->
        <el-descriptions-item label="客户单价 (￥)">{{ selectedItem.customerUnitPrice }}</el-descriptions-item>
        <el-descriptions-item label="客户运费 (￥)">{{ selectedItem.customerFreight }}</el-descriptions-item>
        <el-descriptions-item label="客户上架费 (￥)">{{ selectedItem.customerShelvingFee }}</el-descriptions-item>
        <el-descriptions-item label="客户杂费 (￥)">{{ selectedItem.customerMiscellaneousFees }}</el-descriptions-item>
        <el-descriptions-item label="保险费 (￥)">{{ selectedItem.insuranceFee }}</el-descriptions-item>
        <el-descriptions-item label="提货费 (￥)">{{ selectedItem.goodCostGet }}</el-descriptions-item>
        <el-descriptions-item label="客户头程账单合计 (￥)">{{ selectedItem.customerInitialBillingTotal }}</el-descriptions-item>

        <!-- 其他信息 -->
        <el-descriptions-item label="付款主体">{{ selectedItem.payBody }}</el-descriptions-item>
        <el-descriptions-item label="备注说明">{{ selectedItem.remarks }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {exportCheck, getWpsAllData} from "@/api/wps_list_export/wps_list_export";


export default {
  name: 'wps_list_export',
  setup() {
    const dataSource = ref([]);
    const loading = ref(false);
    const showSearch = ref(true);
    const isModalVisible = ref(false);
    const selectedItem = ref(null);
    const single = ref(true);
    const multiple = ref(true);
    const totalRecords = ref(0);
    const daterangeCreateTime = ref([]);

    const queryParams = reactive({
      page: 1,
      pageSize: 10,
      customerCode: '',
      warehousingNumber: null,
      orderStatus: '',
      beginCreateTime: '',
      endCreateTime: ''
    });

    const fetchData = async () => {
      loading.value = true;
      try {
        const data = await getWpsAllData({
          page: queryParams.page,
          pageSize: queryParams.pageSize,
          warehousingNumber: queryParams.warehousingNumber,
        });
        if (data?.pageData && Array.isArray(data.pageData)) {
          dataSource.value = data.pageData; // 设置表格数据
          totalRecords.value = data.totalRecords || 0; // 总记录数
        } else {
          ElMessage.error('数据格式不正确，请联系管理员');
        }
      } catch (error) {
        ElMessage.error('发生意外错误');
      } finally {
        loading.value = false;
      }
    };

    const postRobot = async (item) => {
      // 使用 Vue 的 reactive 状态控制加载
      loading.value = true;

      // 弹出二级确认框
      ElMessageBox.confirm('您确定要推送账单机器人吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(async () => {
            // 用户点击 "确定" 后继续执行请求
            try {
              const response = await exportCheck(item); // 假设 `exportCheck` 是已引入的 API 方法
              console.log(response);

              if (response.code !== '200') {
                // API 响应状态码不为 200，提示错误信息
                ElMessage.success(response.message || '推送账单机器人成功');
              }
            } catch (error) {
              // 捕获异常，根据错误类型显示信息
              if (error.response) {
                const errorData = error.response.data || { message: '服务器响应异常' };
                ElMessage.error(errorData.message || '未知错误');
              } else {
                // 捕获非 HTTP 错误
                ElMessage.error(error.message || '发生意外错误');
              }
            } finally {
              loading.value = false; // 结束加载状态
            }
          })
          .catch(() => {
            // 用户点击 "取消" 后，终止操作
            loading.value = false;
            ElMessage.info('操作已取消');
          });
    };



    const handleQuery = () => {
      queryParams.page = 1;
      fetchData();
    };

    const resetQuery = () => {
      Object.assign(queryParams, {
        customerCode: '',
        warehousingNumber: '',
        orderStatus: '',
        page: 1,
        pageSize: 10,
      });
      daterangeCreateTime.value = [];
      fetchData();
    };

    const handlePageChange = (pagination) => {
      const { limit, page } = pagination; // 解构出 limit 和 page
      queryParams.page = page;            // 更新当前页码
      queryParams.pageSize = limit;// 更新每页条目数
      console.log(limit)
      fetchData();                 // 重新加载数据
    };

    const handleSelectionChange = (selection) => {
      single.value = selection.length !== 1;
      multiple.value = selection.length === 0;
    };

    const handleOpenDetail = (item) => {
      console.log('查看详情:', item); // 检查 item 数据是否正确
      selectedItem.value = { ...item }; // 确保赋值为完整的当前行数据
      isModalVisible.value = true;
    };


    const handleCloseDetail = () => {
      isModalVisible.value = false;
      selectedItem.value = null;
    };

    const handleAdd = () => {
      ElMessage.info('新增功能暂未实现');
    };

    const handleUpdate = () => {
      ElMessage.info('修改功能暂未实现');
    };

    const handleDelete = () => {
      ElMessage.info('删除功能暂未实现');
    };

    const handleExport = () => {
      ElMessage.info('导出功能暂未实现');
    };

    const handleDateChange = () => {
      queryParams.beginCreateTime = daterangeCreateTime.value[0] || '';
      queryParams.endCreateTime = daterangeCreateTime.value[1] || '';
    };

    onMounted(() => {
      fetchData();
    });

    return {
      dataSource,
      loading,
      showSearch,
      isModalVisible,
      selectedItem,
      single,
      multiple,
      totalRecords,
      queryParams,
      daterangeCreateTime,
      handleQuery,
      resetQuery,
      handlePageChange,
      handleSelectionChange,
      handleOpenDetail,
      handleCloseDetail,
      handleAdd,
      handleUpdate,
      handleDelete,
      handleExport,
      postRobot
    };
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
