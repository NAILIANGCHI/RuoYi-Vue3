<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="微信昵称" prop="wxName">
        <el-input
            v-model="queryParams.wxName"
            placeholder="请输入微信昵称"
            clearable
            @keyup.enter="handleQuery"
        />
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
            @click="handleAddQrCode"
            v-hasPermi="['robotconfig:robotconfig:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="robotconfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="微信头像" align="center" prop="wxPic">
        <template #default="scope">
          <img v-if="scope.row.wxPic" :src="scope.row.wxPic" alt="微信头像" class="wx-avatar" style="width: 40px; height: 40px; border-radius: 50%;" />
          <span v-else>暂无头像</span>
        </template>
      </el-table-column>
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
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['robotconfig:robotconfig:remove']">删除</el-button>
          <el-button link type="success" icon="Play" @click="handleStartRobot(scope.row)" v-hasPermi="['robot:manager:start']">启动</el-button>
          <el-button link type="danger" icon="Stop" @click="handleStopRobot(scope.row)" v-hasPermi="['robot:manager:stop']">停止</el-button>
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
          <!-- 微信头像显示区域 -->
          <div class="avatar-container" style="margin: 10px 0; text-align: center;">
            <img v-if="form.wxPic" :src="form.wxPic" alt="微信头像" class="wx-avatar" style="width: 80px; height: 80px; border-radius: 50%;" />
            <span v-else>扫码登录后显示头像</span>
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
import { listRobotconfig, getRobotconfig, delRobotconfig, addRobotconfig, updateRobotconfig, wxBotQrCode, confirmWxLogin, startRobot, stopRobot, getRobotStatus } from "@/api/robotconfig/robotconfig";
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

// 查询参数独立管理
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  wxName: null,
});

// 表单数据独立管理
const form = reactive({
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
});

// 二维码数据独立管理
const qrCodeBase64 = ref("");

// 表单验证规则
const rules = {
  remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
};

// 当前操作的数据ID，用于标识正在操作的是哪一条数据
const currentOperationId = ref(null);

/** 查询微信机器人配置列表 */
function getList() {
  loading.value = true;
  listRobotconfig(queryParams).then(response => {
    robotconfigList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消并重置表单 */
function cancel() {
  open.value = false;
  currentOperationId.value = null;
  // 延迟重置表单，确保弹窗完全关闭
  setTimeout(() => {
    reset();
  }, 300);
}

/** 表单重置 */
function reset() {
  // 清空表单数据
  Object.keys(form).forEach(key => {
    form[key] = '';
  });
  form.id = null;
  qrCodeBase64.value = "";
  proxy.resetForm("robotconfigRef");
}

/** 搜索 */
function handleQuery() {
  queryParams.pageNum = 1;
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
  qrCodeBase64.value = "";
  // 新增时appid为空
  // 自动获取二维码，即使appid为空
  getQRCode(form);
}

/** 修改机器人 */
function handleUpdate(row) {
  // 记录当前操作的数据ID，确保操作的是正确的数据
  currentOperationId.value = row.id;

  // 不调用reset()，保留当前状态，但确保先关闭弹窗
  if (open.value) {
    open.value = false;
    // 短暂延迟确保弹窗完全关闭后再打开新的
    setTimeout(() => {
      loadRobotData(row.id, row);
    }, 300);
  } else {
    loadRobotData(row.id, row);
  }
}

/** 加载机器人数据并打开编辑弹窗 */
function loadRobotData(id, row) {
  getRobotconfig(id).then(response => {
    if (response.data) {
      // 清空表单数据
      Object.keys(form).forEach(key => {
        form[key] = '';
      });

      // 填充新数据
      Object.assign(form, response.data);
      open.value = true;
      title.value = "修改微信机器人";
      // 传入原始row数据，确保使用正确的appid
      getQRCode(row);
    }
  });
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["robotconfigRef"].validate(valid => {
    if (valid) {
      // 确保提交的数据与当前操作的ID匹配
      if (form.id && form.id !== currentOperationId.value) {
        proxy.$modal.msgError("数据已更新，请刷新页面后重试");
        return;
      }

      const payload = { ...form };
      console.log('提交数据:', payload);

      if (payload.id) {
        updateRobotconfig(payload).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          currentOperationId.value = null;
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

/** 启动机器人 */
function handleStartRobot(row) {
  if (!row.wxAppid) {
    proxy.$modal.msgError("请先完成微信登录获取AppID");
    return;
  }
  
  proxy.$modal.confirm(`是否确认启动微信机器人"${row.wxName || row.wxId}"？`)
    .then(() => {
      loading.value = true;
      return startRobot(row.wxAppid);
    })
    .then(() => {
      loading.value = false;
      proxy.$modal.msgSuccess("机器人启动成功");
      // 启动成功后更新状态
      return getRobotStatus(row.wxAppid);
    })
    .then(response => {
      // 更新表格中该行的数据状态
      const index = robotconfigList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        robotconfigList.value[index].status = response.data?.status || '1';
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 停止机器人 */
function handleStopRobot(row) {
  if (!row.wxAppid) {
    proxy.$modal.msgError("请先完成微信登录获取AppID");
    return;
  }
  
  proxy.$modal.confirm(`是否确认停止微信机器人"${row.wxName || row.wxId}"？`)
    .then(() => {
      loading.value = true;
      return stopRobot(row.wxAppid);
    })
    .then(() => {
      loading.value = false;
      proxy.$modal.msgSuccess("机器人停止成功");
      // 停止成功后更新状态
      return getRobotStatus(row.wxAppid);
    })
    .then(response => {
      // 更新表格中该行的数据状态
      const index = robotconfigList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        robotconfigList.value[index].status = response.data?.status || '0';
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

/** 获取微信二维码 - 支持传入当前行数据 */
async function getQRCode(row) {
  try {
    // 优先使用传入的行数据，其次使用当前表单数据
    // 新增模式下不使用robotconfigList中的数据，避免使用旧token
    let targetAppId = ''; // 默认为空字符串
    if (row && row.wxAppid) {
      targetAppId = row.wxAppid;
    } else if (form.wxAppid) {
      targetAppId = form.wxAppid;
    } else if (form.id && robotconfigList.value && robotconfigList.value.length > 0) {
      targetAppId = robotconfigList.value[0].wxAppid;
    }

    // 无论是新增还是修改模式，都可以获取二维码，即使appid为空
    // 在新增模式下，appid应该保持为空
    if (!targetAppId && form.id) {
      proxy.$modal.msgError("未获取到有效AppID");
      return;
    }

    console.log('请求二维码，appId:', targetAppId, '当前操作ID:', currentOperationId.value);
    const response = await wxBotQrCode(targetAppId);

    // 首先检查响应是否成功
    if (!response || (response.Code !== 200 && response.code !== 200)) {
      console.error('获取二维码失败，响应状态异常:', response);
      proxy.$modal.msgError("获取二维码失败，请重试");
      return;
    }

    console.log('二维码接口响应:', response);
    
    // 统一处理响应数据，优先使用response.Data
    const responseData = response.Data || response.data || {};
    
    // 检查是否有必要的数据
    if (!responseData.Key) {
      proxy.$modal.msgError("获取二维码失败，请重试");
      return;
    }

    console.log('接口返回tokenKey:', responseData.Key);
    
    // 设置wxUuid为接口返回的Key
    form.wxAppid = responseData.Key;
    
    // 清理并设置二维码URL
    if (responseData.QrCodeUrl) {
      console.log('原始二维码URL:', responseData.QrCodeUrl);
      // 清理QrCodeUrl中的额外空格和反引号
      if (responseData.QrCodeUrl.includes('`')) {
        qrCodeBase64.value = responseData.QrCodeUrl.replace(/`/g, '').trim();
      } else {
        qrCodeBase64.value = responseData.QrCodeUrl;
      }
    } else {
      console.error('未获取到二维码图片URL');
      proxy.$modal.msgError("获取二维码图片失败");
      return;
    }

    // 获取并设置wxappid
    if (responseData.WxAppid) {
      form.wxAppid = responseData.WxAppid;  // 从Data.WxAppid获取appid
    } else if (response.wxAppid) {
      form.wxAppid = response.wxAppid;  // 兼容原来的路径
    }

    console.log('清理后的二维码URL:', qrCodeBase64.value);
    console.log('使用的UUID:', form.wxUuid);
    console.log('设置的AppID:', form.wxAppid);
  } catch (error) {
    console.error('获取二维码时发生错误:', error);
    proxy.$modal.msgError("请求失败，请检查网络连接");
  }
}

/** 更换二维码 */
function refreshQRCode() {
  qrCodeBase64.value = "";
  // 清空uuid，确保使用新的token
  form.wxUuid = '';
  console.log('更换二维码，已清空uuid');
  // 传入当前表单数据作为上下文
  getQRCode(form);
}

/** 确认登录 */
async function confirmLogin() {
  // 数据一致性检查
  if (form.id && form.id !== currentOperationId.value) {
    proxy.$modal.msgError("数据已更新，请刷新页面后重试");
    return;
  }

  // 优先检查微信UUID（二维码接口返回的key值），这是确认登录的必要参数
  if (!form.wxAppid) {
    proxy.$modal.msgError("未获取到登录凭证，请先获取二维码并扫码");
    return;
  }

  try {
    // 使用二维码接口返回的key值作为参数
    // 确保使用的是请求二维码时的token，解决参数不匹配问题
    const response = await confirmWxLogin(form.wxAppid);
    console.log('确认登录响应:', response);
    
    if (response.Code === 200) {
      // 检查Data对象是否存在
      if (!response.Data) {
        proxy.$modal.msgError("登录信息获取失败，请重试");
        return;
      }
      
      // 检查账户状态
      if (!response.Data.wxid) {
        proxy.$modal.msgError("账户状态异常，请更换账户重新扫码");
        return;
      }
      
      // 检查昵称是否为空
      if (!response.Data.nick_name) {
        proxy.$modal.msgError("登录失败，请重新扫码登录");
        return;
      }

      // 将返回的数据存入表单 - 基于实际返回的数据结构
      form.wxId = response.Data.wxid || form.wxId; // 使用返回的uuid作为wxId
      form.wxName = response.Data.nick_name || form.wxName;
      
      // 清理头像URL中可能存在的额外空格
      const headImgUrl = response.Data.head_img_url ? response.Data.head_img_url.trim() : '';
      form.wxPic = headImgUrl || form.wxPic; // 统一使用wxPic字段
      
      form.wxStatus = 1; // 设置登录状态为已登录
      
      // 更新wxAppid（如果返回数据中有）
      if (response.Data.wxAppid) {
        form.wxAppid = response.Data.wxAppid;
      }

      proxy.$modal.msgSuccess("登录确认成功！微信信息已更新到表单，请确认无误后点击提交");
    } else {
      proxy.$modal.msgError(response.msg || response.Text || "登录失败，请重试");
    }
  } catch (error) {
    console.error("确认登录失败：", error);
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





















