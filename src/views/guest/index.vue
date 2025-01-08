<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户id" prop="guestId">
        <el-input
            v-model="queryParams.guestId"
            placeholder="请输入客户id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="guestName">
        <el-input
            v-model="queryParams.guestName"
            placeholder="请输入客户名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公司名称" prop="companyName">
        <el-input
            v-model="queryParams.companyName"
            placeholder="请输入公司名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
            v-model="daterangeCreateTime"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['guest:guest:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['guest:guest:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['guest:guest:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['guest:guest:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="guestList" @selection-change="handleSelectionChange">
      <!-- 其他列 -->
      <el-table-column type="selection" width="55" align="center" />
      <!-- 序号列 -->
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column label="客户id" align="center" prop="guestId" />
      <el-table-column label="客户名称" align="center" prop="guestName" />
      <el-table-column label="公司名称" align="center" prop="companyName" />
      <el-table-column label="客户类型" align="center" prop="guestType" />
      <el-table-column label="状态" align="center" prop="state">
        <template #default="scope">
          <dict-tag :options="sys_user_status" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录ip" align="center" prop="loginIp" />
      <el-table-column label="最后登录时间" align="center" prop="loginTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creatName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['guest:guest:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['guest:guest:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改客户主表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="guestRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户名称" prop="guestName">
          <el-input v-model="form.guestName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" type="password"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model="form.mail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <image-upload v-model="form.avatar"/>
        </el-form-item>
        <el-form-item label="备注" prop="remake">
          <el-input v-model="form.remake" placeholder="请输入备注" />
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

<script setup name="Guest">
import { listGuest, getGuest, delGuest, addGuest, updateGuest } from "@/api/guest/guest";

const { proxy } = getCurrentInstance();
const { sys_common_status } = proxy.useDict('sys_common_status');
const { sys_user_status } = proxy.useDict('sys_user_status');

const guestList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const guestId = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    guestId: null,
    guestName: null,
    companyName: null,
    guestType: null,
    createTime: null,
  },
  rules: {
    guestName: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    companyName: [
      { required: true, message: "公司名称不能为空", trigger: "blur" }
    ],
    phoneNumber: [
      { required: true, message: "手机号不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" }
    ],
    mail: [
      { required: true, message: "邮箱不能为空", trigger: "blur" }
    ],
    guestType: [
      { required: true, message: "客户类型不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户主表列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  listGuest(queryParams.value).then(response => {
    guestList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    guestId: null,
    guestName: null,
    companyName: null,
    phoneNumber: null,
    password: null,
    mail: null,
    mailState: null,
    guestType: null,
    state: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    loginIp: null,
    loginTime: null,
    creatName: null,
    avatar: null,
    remake: null
  };
  proxy.resetForm("guestRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  guestId.value = selection.map(item => item.guestId)
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户主表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getGuest(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户主表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["guestRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGuest(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addGuest(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  // 确定是单选还是多选操作
  const selectedGuestIds = row.guestId ? [row.guestId] : guestId.value;

  // 提示用户是否确认删除
  proxy.$modal.confirm('是否确认删除客户代码编号为"' + selectedGuestIds.join(', ') + '"的数据项？').then(() => {
    // 根据是单选还是多选调用删除接口
    const idsToDelete = row.guestId ? [row.id] : ids.value;
    return delGuest(idsToDelete);
  }).then(() => {
    getList(); // 刷新列表
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
    // 用户取消操作或出现错误时的回调（可留空）
  });
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('guest/export', {
    ...queryParams.value
  }, `guest_${new Date().getTime()}.xlsx`)
}

getList();
</script>
