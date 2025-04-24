<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable />
      </el-form-item>
      <el-form-item label="账单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择账单状态" clearable>
          <el-option label="未支付" value="UNPAID" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增账单</el-button>
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

    <el-table v-loading="loading" :data="billList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="账单编号" align="center" prop="billNo" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="运输费" align="center" prop="transportFee" />
      <el-table-column label="上架费" align="center" prop="shelfFee" />
      <el-table-column label="提货费" align="center" prop="pickupFee" />
      <el-table-column label="杂费" align="center" prop="miscFee" />
      <el-table-column label="保险费" align="center" prop="insuranceFee" />
      <el-table-column label="总费用" align="center" prop="totalFee" />
      <el-table-column label="客户应付" align="center" prop="customerFee" />
      <el-table-column label="利润" align="center" prop="profit" />
      <el-table-column label="利润率" align="center" prop="profitRate">
        <template #default="scope">
          {{ scope.row.profitRate }}%
        </template>
      </el-table-column>
      <el-table-column label="账单状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="View" @click="handleView(scope.row)">查看</el-button>
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)" v-if="scope.row.status === 'UNPAID'">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)" v-if="scope.row.status === 'UNPAID'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改账单对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="billFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="运输费" prop="transportFee">
          <el-input-number v-model="form.transportFee" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="上架费" prop="shelfFee">
          <el-input-number v-model="form.shelfFee" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="提货费" prop="pickupFee">
          <el-input-number v-model="form.pickupFee" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="杂费" prop="miscFee">
          <el-input-number v-model="form.miscFee" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="保险费" prop="insuranceFee">
          <el-input-number v-model="form.insuranceFee" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number v-model="form.exchangeRate" :precision="4" :step="0.0001" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBill, getBill, delBill, addBill, updateBill } from '@/api/logistics/bill'

const { proxy } = getCurrentInstance()

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 账单表格数据
const billList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  status: undefined
})

// 表单参数
const form = reactive({
  id: undefined,
  billNo: undefined,
  orderNo: undefined,
  transportFee: undefined,
  shelfFee: undefined,
  pickupFee: undefined,
  miscFee: undefined,
  insuranceFee: undefined,
  exchangeRate: undefined,
  status: 'UNPAID'
})

// 表单校验
const rules = {
  orderNo: [{ required: true, message: "订单编号不能为空", trigger: "blur" }],
  transportFee: [{ required: true, message: "运输费不能为空", trigger: "blur" }],
  shelfFee: [{ required: true, message: "上架费不能为空", trigger: "blur" }],
  pickupFee: [{ required: true, message: "提货费不能为空", trigger: "blur" }],
  miscFee: [{ required: true, message: "杂费不能为空", trigger: "blur" }],
  insuranceFee: [{ required: true, message: "保险费不能为空", trigger: "blur" }],
  exchangeRate: [{ required: true, message: "汇率不能为空", trigger: "blur" }]
}

/** 查询账单列表 */
function getList() {
  loading.value = true
  listBill(queryParams).then(response => {
    billList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.id = undefined
  form.billNo = undefined
  form.orderNo = undefined
  form.transportFee = undefined
  form.shelfFee = undefined
  form.pickupFee = undefined
  form.miscFee = undefined
  form.insuranceFee = undefined
  form.exchangeRate = undefined
  form.status = 'UNPAID'
  proxy.resetForm("billFormRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加账单"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getBill(id).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改账单"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["billFormRef"].validate(valid => {
    if (valid) {
      if (form.id) {
        updateBill(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBill(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const billIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除账单编号为"' + billIds + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return delBill(billIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('logistics/bill/export', {
    ...queryParams
  }, `bill_${new Date().getTime()}.xlsx`)
}

/** 查看按钮操作 */
function handleView(row) {
  proxy.$router.push({ path: '/logistics/bill/detail', query: { id: row.id }})
}

/** 获取状态类型 */
function getStatusType(status) {
  const statusMap = {
    'UNPAID': 'warning',
    'PAID': 'success',
    'CANCELLED': 'danger'
  }
  return statusMap[status]
}

/** 获取状态文本 */
function getStatusText(status) {
  const statusMap = {
    'UNPAID': '未支付',
    'PAID': '已支付',
    'CANCELLED': '已取消'
  }
  return statusMap[status]
}

onMounted(() => {
  getList()
})
</script> 