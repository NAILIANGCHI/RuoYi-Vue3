<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="客户" prop="customerId" v-if="isAdmin">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="(item, key) in orderStatusOptions"
            :key="key"
            :label="item.text"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="货值类别" prop="cargoValueType">
        <el-select v-model="queryParams.cargoValueType" placeholder="请选择货值类别" clearable>
          <el-option
            v-for="(item, key) in cargoValueTypeOptions"
            :key="key"
            :label="item.text"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="hasRole(['admin', 'common'])">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增订单</el-button>
      </el-col>
      <el-col :span="1.5" v-if="hasRole(['admin'])">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5" v-if="hasRole(['admin'])">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5" v-if="hasRole(['admin'])">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar 
        :showSearch="showSearch"
        @update:showSearch="showSearch = $event"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" align="center" v-if="hasRole(['admin'])" />
      <el-table-column label="订单编号" align="center" prop="orderNo" min-width="120" />
      <el-table-column label="客户信息" align="center" v-if="isAdmin" min-width="150">
        <template #default="scope">
          <div class="customer-info">
            <span class="customer-name">{{ scope.row.customerName }}</span>
            <el-tag size="small" type="info" class="ml-2">{{ scope.row.customerId }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="货物类型" align="center" prop="cargoType" min-width="100" />
      <el-table-column label="货值类别" align="center" prop="cargoValueType" min-width="100">
        <template #default="scope">
          <el-tag :type="getCargoValueTypeTag(scope.row.cargoValueType)">
            {{ getCargoValueTypeText(scope.row.cargoValueType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="重量(kg)" align="center" prop="cargoWeight" width="100" />
      <el-table-column label="体积(m³)" align="center" prop="cargoVolume" width="100" />
      <el-table-column label="发货地址" align="center" prop="shippingAddress" min-width="150" show-overflow-tooltip />
      <el-table-column label="收货地址" align="center" prop="receivingAddress" min-width="150" show-overflow-tooltip />
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.orderStatus)">
            {{ getStatusText(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button 
            type="primary" 
            link 
            icon="View" 
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-dropdown trigger="click" @command="(command) => handleCommand(command, scope.row)">
            <el-button type="primary" link>
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  v-if="hasRole(['admin']) && scope.row.orderStatus === 'PENDING'"
                  command="edit" 
                  icon="Edit"
                >修改</el-dropdown-item>
                <el-dropdown-item 
                  v-if="hasRole(['admin']) && scope.row.orderStatus === 'PENDING'"
                  command="delete" 
                  icon="Delete"
                >删除</el-dropdown-item>
                <el-dropdown-item 
                  v-if="hasRole(['admin']) && scope.row.orderStatus === 'PENDING'"
                  command="approve" 
                  icon="Check"
                >审批</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total" 
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 添加或修改订单对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="orderFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId" v-if="isAdmin">
          <el-select v-model="form.customerId" placeholder="请选择客户">
            <el-option
              v-for="user in userOptions"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="货物类型" prop="cargoType">
          <el-input v-model="form.cargoType" placeholder="请输入货物类型" />
        </el-form-item>
        <el-form-item label="货值类别" prop="cargoValueType">
          <el-select v-model="form.cargoValueType" placeholder="请选择货值类别">
            <el-option label="FBW" value="FBW" />
            <el-option label="FBO" value="FBO" />
            <el-option label="FBA" value="FBA" />
          </el-select>
        </el-form-item>
        <el-form-item label="货物重量" prop="cargoWeight">
          <el-input-number v-model="form.cargoWeight" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="货物体积" prop="cargoVolume">
          <el-input-number v-model="form.cargoVolume" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="发货地址" prop="shippingAddress">
          <el-input v-model="form.shippingAddress" type="textarea" placeholder="请输入发货地址" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receivingAddress">
          <el-input v-model="form.receivingAddress" type="textarea" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="中转仓" prop="transitWarehouse">
          <el-input v-model="form.transitWarehouse" placeholder="请输入中转仓信息" />
        </el-form-item>
        <el-form-item label="订单总金额" prop="totalAmount">
          <el-input-number v-model="form.totalAmount" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="汇率" prop="exchangeRate">
          <el-input-number v-model="form.exchangeRate" :precision="4" :step="0.1" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog :title="approveTitle" v-model="approveOpen" width="500px" append-to-body>
      <el-form ref="approveFormRef" :model="approveForm" :rules="approveRules" label-width="80px">
        <el-form-item label="审批结果" prop="approveResult">
          <el-radio-group v-model="approveForm.approveResult">
            <el-radio label="APPROVED">通过</el-radio>
            <el-radio label="REJECTED">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="approveRemark">
          <el-input 
            v-model="approveForm.approveRemark" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审批意见" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApprove">确 定</el-button>
          <el-button @click="cancelApprove">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { listOrder, getOrder, delOrder, addOrder, updateOrder, approveOrder } from '@/api/logistics/order'
import { listUser } from '@/api/system/user'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()

const userStore = useUserStore()
const router = useRouter()

// 用户选项列表
const userOptions = ref([])

// 判断是否有指定角色
const hasRole = (roles) => {
  return roles.some(role => userStore.roles.includes(role))
}

// 判断是否是管理员
const isAdmin = computed(() => {
  return userStore.roles.includes('admin')
})

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
// 订单表格数据
const orderList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 订单状态选项
const orderStatusOptions = {
  'PENDING': { type: 'warning', text: '待审批' },
  'APPROVED': { type: 'success', text: '已审批' },
  'REJECTED': { type: 'danger', text: '已驳回' },
  'IN_TRANSIT': { type: 'primary', text: '运输中' },
  'COMPLETED': { type: 'info', text: '已完成' }
}

// 货值类别选项
const cargoValueTypeOptions = {
  'FBW': { type: 'success', text: 'FBW' },
  'FBO': { type: 'warning', text: 'FBO' },
  'FBA': { type: 'info', text: 'FBA' }
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  customerName: undefined,
  orderStatus: undefined,
  cargoValueType: undefined
})

// 表单参数
const form = reactive({
  orderId: undefined,
  orderNo: undefined,
  customerId: undefined,
  cargoType: undefined,
  cargoWeight: undefined,
  cargoVolume: undefined,
  cargoValueType: undefined,
  shippingAddress: undefined,
  receivingAddress: undefined,
  transitWarehouse: undefined,
  orderStatus: 'PENDING',
  paymentStatus: 'UNPAID',
  totalAmount: undefined,
  exchangeRate: undefined
})

// 表单校验
const rules = {
  customerId: [{ required: true, message: "请选择客户", trigger: "change" }],
  cargoType: [{ required: true, message: "货物类型不能为空", trigger: "blur" }],
  cargoValueType: [{ required: true, message: "货值类别不能为空", trigger: "change" }],
  cargoWeight: [{ required: true, message: "货物重量不能为空", trigger: "blur" }],
  cargoVolume: [{ required: true, message: "货物体积不能为空", trigger: "blur" }],
  shippingAddress: [{ required: true, message: "发货地址不能为空", trigger: "blur" }],
  receivingAddress: [{ required: true, message: "收货地址不能为空", trigger: "blur" }],
  transitWarehouse: [{ required: true, message: "中转仓不能为空", trigger: "blur" }],
  totalAmount: [{ required: true, message: "订单总金额不能为空", trigger: "blur" }],
  exchangeRate: [{ required: true, message: "汇率不能为空", trigger: "blur" }]
}

// 审批相关
const approveOpen = ref(false)
const approveTitle = ref('')
const approveForm = reactive({
  orderId: undefined,
  approveResult: 'APPROVED',
  approveRemark: ''
})
const approveRules = {
  approveResult: [{ required: true, message: "请选择审批结果", trigger: "change" }],
  approveRemark: [{ required: true, message: "请输入审批意见", trigger: "blur" }]
}

/** 查询订单列表 */
const getList = async () => {
  try {
    const response = await listOrder(queryParams)
    orderList.value = response.rows
    total.value = response.total
    loading.value = false
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
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
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  if (!isAdmin.value) {
    form.customerId = userStore.id
  }
  open.value = true
  title.value = "添加订单"
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const orderId = row.orderId || ids.value[0]
  try {
    const response = await getOrder(orderId)
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改订单"
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderFormRef"].validate(async (valid) => {
    if (valid) {
      try {
        if (!isAdmin.value) {
          form.customerId = userStore.id
        }
        
        // 确保所有必要字段都有值
        const orderData = {
          ...form,
          orderStatus: 'PENDING',
          paymentStatus: 'UNPAID',
          // 确保数值类型正确
          cargoWeight: Number(form.cargoWeight),
          cargoVolume: Number(form.cargoVolume),
          totalAmount: Number(form.totalAmount),
          exchangeRate: Number(form.exchangeRate)
        }
        
        if (form.orderId) {
          await updateOrder(orderData)
          ElMessage.success('修改成功')
        } else {
          await addOrder(orderData)
          ElMessage.success('新增成功')
        }
        open.value = false
        getList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const orderIds = row.orderId || ids.value
  ElMessageBox.confirm('是否确认删除选中的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await delOrder(orderIds)
      getList()
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('/logistics/order/export', {
    ...queryParams
  }, `order_${new Date().getTime()}.xlsx`)
}

/** 查看按钮操作 */
function handleView(row) {
  const orderId = row.orderId || row.id
  router.push(`/logistics/order/detail/${orderId}`)
}

/** 获取状态类型 */
const getStatusType = (status) => {
  return orderStatusOptions[status]?.type || ''
}

/** 获取状态文本 */
const getStatusText = (status) => {
  return orderStatusOptions[status]?.text || status
}

/** 重置表单数据 */
function reset() {
  form.orderId = undefined
  form.orderNo = undefined
  form.customerId = undefined
  form.cargoType = undefined
  form.cargoWeight = undefined
  form.cargoVolume = undefined
  form.cargoValueType = undefined
  form.shippingAddress = undefined
  form.receivingAddress = undefined
  form.transitWarehouse = undefined
  form.orderStatus = 'PENDING'
  form.paymentStatus = 'UNPAID'
  form.totalAmount = undefined
  form.exchangeRate = undefined
  proxy.resetForm("orderFormRef")
}

// 添加分页相关的方法
const handlePageChange = (page) => {
  queryParams.pageNum = page
  getList()
}

const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getList()
}

onMounted(() => {
  getList()
  if (isAdmin.value) {
    getUserList()
  }
})

// 获取用户列表（仅管理员可见）
const getUserList = async () => {
  if (isAdmin.value) {
    try {
      const response = await listUser({ status: '0' })
      userOptions.value = response.rows || []
    } catch (error) {
      console.error('获取用户列表失败:', error)
    }
  }
}

// 判断是否有权限
const hasPermi = (permission) => {
  return userStore.permissions.includes(permission)
}

// 获取货值类别标签类型
const getCargoValueTypeTag = (type) => {
  return cargoValueTypeOptions[type]?.type || ''
}

// 获取货值类别文本
const getCargoValueTypeText = (type) => {
  return cargoValueTypeOptions[type]?.text || type
}

// 审批操作
const handleApprove = (row) => {
  approveForm.orderId = row.orderId
  approveForm.approveResult = 'APPROVED'
  approveForm.approveRemark = ''
  approveTitle.value = '订单审批'
  approveOpen.value = true
}

// 提交审批
const submitApprove = () => {
  proxy.$refs["approveFormRef"].validate(async (valid) => {
    if (valid) {
      try {
        await approveOrder(approveForm)
        ElMessage.success('操作成功')
        approveOpen.value = false
        getList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 取消审批
const cancelApprove = () => {
  approveOpen.value = false
  resetApproveForm()
}

// 重置审批表单
const resetApproveForm = () => {
  approveForm.orderId = undefined
  approveForm.approveResult = 'APPROVED'
  approveForm.approveRemark = ''
  proxy.resetForm("approveFormRef")
}

// 添加下拉菜单命令处理方法
const handleCommand = (command, row) => {
  switch (command) {
    case 'view':
      handleView(row)
      break
    case 'edit':
      handleUpdate(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'approve':
      handleApprove(row)
      break
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.ml-2 {
  margin-left: 8px;
}

.customer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.customer-name {
  font-weight: 500;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .el-table {
    width: 100%;
    overflow-x: auto;
  }
  
  .el-table__body-wrapper {
    overflow-x: auto;
  }
}

/* 表格内容过长时显示省略号 */
.el-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 优化下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
}

/* 优化按钮组样式 */
.el-button-group {
  display: flex;
  gap: 8px;
}

/* 优化表格行高 */
:deep(.el-table__row) {
  height: 50px;
}

/* 优化表格头部样式 */
:deep(.el-table__header) {
  background-color: #f5f7fa;
}

/* 优化表格内容样式 */
:deep(.el-table__body) {
  background-color: #ffffff;
}

/* 优化表格边框样式 */
:deep(.el-table--border) {
  border: 1px solid #ebeef5;
}

/* 优化表格hover效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style> 