<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="客户代码" prop="customerCode">
        <el-input
            v-model="queryParams.customerCode"
            placeholder="请输入客户代码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="入库单号" prop="warehousingNumber">
        <el-input
            v-model="queryParams.warehousingNumber"
            placeholder="请输入入库单号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option label="已完成" value="completed" />
          <el-option label="进行中" value="inProgress" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
            v-model="daterangeCreateTime"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
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

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column label="客户代码" align="center" prop="customerCode" />
      <el-table-column label="入库单号" align="center" prop="warehousingNumber" />
      <el-table-column label="订单状态" align="center" prop="orderStatus" />
      <el-table-column label="箱数" align="center" prop="boxCount" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleOpenDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-show="totalRecords > 0"
        :total="totalRecords"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handlePageChange"
    />

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="isModalVisible" title="详细信息" width="500px" append-to-body>
      <el-descriptions border column="1">
        <el-descriptions-item label="序号">{{ selectedItem.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="卖家发货日期">{{ selectedItem.sellerShipmentDate }}</el-descriptions-item>
        <el-descriptions-item label="客户交货物流单号">{{ selectedItem.customerDeliveryTrackingNumber }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {ref, reactive, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import {getWpsAllData} from "@/api/wps_list_export/wps_list_export";


export default {
  name: 'Logistics',
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
      pageNum: 1,
      pageSize: 10,
      customerCode: '',
      warehousingNumber: '',
      orderStatus: '',
      beginCreateTime: '',
      endCreateTime: ''
    });

    const fetchData = async () => {
      loading.value = true;
      try {
        const response = await getWpsAllData({
          page: queryParams.pageNum,
          pageSize: queryParams.pageSize,
          // Uncomment and provide additional filters as needed
          // customerCode: queryParams.customerCode,
          // warehousingNumber: queryParams.warehousingNumber,
          // orderStatus: queryParams.orderStatus,
          // beginCreateTime: queryParams.beginCreateTime,
          // endCreateTime: queryParams.endCreateTime,
        });
        console.log(response)
        // if (response?.code !== '200') {
        //   ElMessage.error(response?.message || '未知错误，请稍后重试');
        //   return;
        // }

        const data = response;

        if (data?.pageData && Array.isArray(data.pageData)) {
          dataSource.value = data.pageData; // 设置表格数据
          totalRecords.value = data.totalRecords || 0; // 总记录数
        } else {
          ElMessage.error('数据格式不正确，请联系管理员');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        ElMessage.error('发生意外错误，请检查网络或稍后重试');
      } finally {
        loading.value = false;
      }
    };


    const handleQuery = () => {
      queryParams.pageNum = 1;
      fetchData();
    };

    const resetQuery = () => {
      Object.assign(queryParams, {
        customerCode: '',
        warehousingNumber: '',
        orderStatus: '',
        pageNum: 1,
        pageSize: 10
      });
      daterangeCreateTime.value = [];
      fetchData();
    };

    const handlePageChange = (page) => {
      queryParams.pageNum = page;
      fetchData();
    };

    const handleSelectionChange = (selection) => {
      single.value = selection.length !== 1;
      multiple.value = selection.length === 0;
    };

    const handleOpenDetail = (item) => {
      selectedItem.value = item;
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
      handleExport
    };
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
