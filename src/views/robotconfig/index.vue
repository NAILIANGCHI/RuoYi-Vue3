<template>
  <div class="app-container">
    <!-- 搜索表单 -->
<!--    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">-->
<!--      <el-form-item label="微信昵称" prop="wxName">-->
<!--        <el-input-->
<!--            v-model="queryParams.wxName"-->
<!--            placeholder="请输入微信昵称"-->
<!--            clearable-->
<!--            @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item>-->
<!--        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>-->
<!--        <el-button icon="Refresh" @click="resetQuery">重置</el-button>-->
<!--      </el-form-item>-->
<!--    </el-form>-->

    <!-- 新增按钮 -->
<!--    <el-row :gutter="10" class="mb8">-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            plain-->
<!--            icon="Plus"-->
<!--            @click="handleAddQrCode"-->
<!--            v-hasPermi="['robotconfig:robotconfig:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
<!--    </el-row>-->

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="robotconfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="微信头像" align="center" prop="wxPic" />
      <el-table-column label="微信appid" align="center" prop="wxAppid" />
      <el-table-column label="微信id" align="center" prop="wxId" />
      <el-table-column label="微信昵称" align="center" prop="wxName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_user_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['robotconfig:robotconfig:edit']">修改</el-button>
<!--          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['robotconfig:robotconfig:remove']">删除</el-button>-->
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

    <!-- 添加或修改微信机器人配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="robotconfigRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="扫码登录" prop="scan_qr">
          <div class="qr-container">
            <img v-if="qrCodeBase64" :src="qrCodeBase64" alt="微信二维码" class="qr-image" />
            <el-button v-else type="info" loading>二维码加载中...</el-button>
          </div>
          <div class="qr-actions">
            <el-button type="primary" @click="refreshQRCode">更换二维码</el-button>
            <el-button type="success" @click="confirmLogin">确认登录</el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listRobotconfig, getRobotconfig, delRobotconfig, addRobotconfig, updateRobotconfig, wxBotQrCode, confirmWxLogin } from "@/api/robotconfig/robotconfig";
import { getCurrentInstance, ref, reactive, toRefs, onMounted } from "vue";

const { proxy } = getCurrentInstance();
const { sys_user_status } = proxy.useDict('sys_user_status');

const robotconfigList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 表单数据
const data = reactive({
  form: {
    id: null,
    wxAppid: "",
    wxUuid: "",
    wxQr: "",
    wxId: "",
    wxName: "",
    status: "",
    wxPic: "",
    createBy: "",
    createTime: "",
    updateBy: "",
    updateTime: "",
    remark: "",
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    wxName: null,
  },
  rules: {
    remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
  },
  qrCodeBase64: "",
});

const { queryParams, form, qrCodeBase64 } = toRefs(data);

/** 查询微信机器人配置列表 */
function getList() {
  loading.value = true;
  listRobotconfig(queryParams.value).then(response => {
    robotconfigList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消并重置表单 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    wxAppid: "",
    wxUuid: "",
    wxQr: "",
    wxId: "",
    wxName: "",
    status: "",
    wxPic: "",
    createBy: "",
    createTime: "",
    updateBy: "",
    updateTime: "",
    remark: "",
  };
  qrCodeBase64.value = "";
  proxy.resetForm("robotconfigRef");
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置搜索 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 处理表格多选 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增机器人 */
async function handleAddQrCode() {
  reset();
  open.value = true;
  title.value = "添加微信机器人";

  try {
    const response = await wxBotQrCode();
    if (response.data) {
      Object.assign(form.value, response.data);
      qrCodeBase64.value = response.data.qrImgBase64 || "";
    } else {
      proxy.$modal.msgError("获取二维码失败，请重试");
    }
  } catch (error) {
    proxy.$modal.msgError("请求失败，请检查网络连接");
  }
}

/** 修改机器人 */
function handleUpdate(row) {
  reset();
  getRobotconfig(row.id).then(response => {
    if (response.data) {
      Object.assign(form.value, response.data);
      open.value = true;
      title.value = "修改微信机器人";
      getQRCode();
    }
  });
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["robotconfigRef"].validate(valid => {
    if (valid) {
      const payload = { ...form.value };

      if (payload.id) {
        updateRobotconfig(payload).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRobotconfig(payload).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除机器人 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm(`是否确认删除微信机器人配置编号为"${_ids}"的数据项？`)
      .then(() => delRobotconfig(_ids))
      .then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
      })
      .catch(() => {});
}

/** 获取微信二维码 */
async function getQRCode() {
  try {
    const response = await wxBotQrCode(robotconfigList.value[0].wxAppid);
    if (response.data && response.data.qrImgBase64) {
      qrCodeBase64.value = response.data.qrImgBase64;
      // 存储 uuid，用于确认登录
      form.value.wxUuid = response.data.uuid;  // 存储 uuid
    } else {
      proxy.$modal.msgError("获取二维码失败，请重试");
    }
  } catch (error) {
    proxy.$modal.msgError("请求失败，请检查网络连接");
  }
}

/** 更换二维码 */
function refreshQRCode() {
  qrCodeBase64.value = "";
  getQRCode();
}

/** 确认登录 */
async function confirmLogin() {
  if (!form.value.wxUuid) {
    proxy.$modal.msgError("缺少必要参数，无法确认登录");
    return;
  }

  try {
   var data = {
      appId: form.value.wxAppid,
      uuid: form.value.wxUuid,  // 使用存储的 uuid
    }
    const response = await confirmWxLogin(data);

    if (response.code === 200) {
      // 修正拼写错误 mull 为 null
      if(response.data.nickName === null) {
        proxy.$modal.msgError("失败，请重新扫码登录");
        return;
      }
      proxy.$modal.msgSuccess("登录确认成功！");
      updateRobotconfig(payload).then(() => {
        proxy.$modal.msgSuccess("更新成功");
        open.value = false;
        getList();
      });
      open.value = false; // 关闭弹窗
      getList(); // 刷新列表
    } else {
      proxy.$modal.msgError(response.msg || "登录失败，请重试");
    }
  } catch (error) {
    console.log("确认登录失败：", error)
    proxy.$modal.msgError("请求失败，请检查网络连接");
  }
}


// 组件加载时获取数据
onMounted(() => {
  getList();
});
</script>


<style scoped>
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.qr-image {
  max-width: 300px;
  max-height: 300px;
}
.qr-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>





















