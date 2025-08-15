<template>
  <el-dialog
    v-model="playerData.openDefectDelete"
    title="提示"
    width="400px"
    :align-center="true"
    :before-close="handleClose"
    draggable
    :modal="true"
  >
    <div>
      已选中缺陷 <span style="font-weight: 600;">{{formData.defectType}}</span> ，请选择将要进行的操作：
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button type="danger" @click="handleSubmit" :loading="loading">删除</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { playerDataStore } from '../hooks'

// 全局数据
const playerData = playerDataStore()

// 表单数据
interface DefectFormData {
  defectType: string
  id?: number // 假设有一个 ID 字段用于标识缺陷
}

const loading = ref(false)
const formData = ref<DefectFormData>({
  defectType: '',
  id: undefined, // 初始化为 undefined
})


// 监听 data 回填
watch(
  () => playerData.defectData,
  (newVal) => {
    if (newVal) {
      formData.value = { ...formData.value, ...newVal }
    }
  },
  { deep: true }
)

// 编辑
const handleEdit = () => {
  handleClose()
  playerData.openDefectConfirm = true
}

// 提交表单
const handleSubmit = async () => {
  if (loading.value) return // 防止重复提交
  loading.value = true
  console.log('提交删除', formData.value)
  try {
    loading.value = false
  } catch (error) {
    console.error('删除失败:', error)
    loading.value = false
  } finally {
    handleClose()
  }
}

// 关闭弹窗
const handleClose = () => {
  playerData.openDefectDelete = false
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style>