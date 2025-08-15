<template>
  <el-dialog
    v-model="playerData.openHelp"
    title="帮助手册 - 快捷键说明"
    width="600px"
    :align-center="true"
    :before-close="handleClose"
    draggable
    :modal="true"
  >
    <el-descriptions :column="2" border label-class-name="label-class" class="manual-descriptions">
      <!-- <el-descriptions-item label="W / ⬆">上一张缺陷</el-descriptions-item>
      <el-descriptions-item label="S / ⬇">下一张缺陷</el-descriptions-item> -->
      <el-descriptions-item label="A">新增缺陷</el-descriptions-item>
      <el-descriptions-item label="双击缺陷框">删除/编辑缺陷</el-descriptions-item>
      <el-descriptions-item label="Q">快退</el-descriptions-item>
      <el-descriptions-item label="E">快进</el-descriptions-item>
      <el-descriptions-item label="V">显示/隐藏缺陷信息</el-descriptions-item>
      <el-descriptions-item label="R">画布复位</el-descriptions-item>
      <el-descriptions-item label="ESC">退出全屏</el-descriptions-item>
      <el-descriptions-item label="空格">暂停或播放</el-descriptions-item>
    </el-descriptions>

    <!-- <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </span>
    </template> -->
  </el-dialog>
</template>

<script setup lang="ts">
import { playerDataStore } from '../hooks'

// 全局数据
const playerData = playerDataStore()

// 关闭弹窗
const handleClose = () => {
  playerData.openHelp = false
}
</script>

<style scoped lang="scss">
.manual-descriptions {
  margin-bottom: 20px;
}

.label-class {
  font-weight: bold;
  width: 160px;
  text-align: center;
}
</style>