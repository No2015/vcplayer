<template>
    <div class="dialog-content">
      <!-- 工具栏 -->
      <div class="setting-item" v-if="!hideTool">
        <label class="setting-label">工具栏：</label>
        <el-switch v-model="playerData.showTool" class="setting-switch" />
      </div>

      <!-- 对比度 -->
      <div class="setting-item">
        <label class="setting-label">对比度：</label>
        <el-slider v-model="playerData.toolData.contrast" :min="0" :max="100" class="setting-slider" />
        <span class="setting-value">{{ playerData.toolData.contrast }}%</span>
      </div>

      <!-- 页面亮度 -->
      <div class="setting-item">
        <label class="setting-label">页面亮度：</label>
        <el-slider v-model="playerData.toolData.brightness" :min="0" :max="100" class="setting-slider" />
        <span class="setting-value">{{ playerData.toolData.brightness }}%</span>
      </div>

      <!-- 帧步数 -->
      <div class="setting-item">
        <label class="setting-label">帧步数：</label>
        <el-input-number
          v-model="playerData.toolData.frameStep"
          :min="1"
          :max="maxFrameStep"
          controls-position-right
          class="setting-input"
        />
        <!-- <span style="margin-left: 4px; font-size: 12px; opacity: 0.6;">(快进/快退的步数)</span> -->
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { playerDataStore } from '../hooks'

const props = defineProps<{
  hideTool?: boolean // 是否隐藏工具栏
}>()

// 全局数据
const playerData = playerDataStore()

const maxFrameStep = computed(() => {
  const file = playerData.fileList[playerData.selectedFileIndex]
  return file?.frames || 99
})

</script>

<style scoped lang="scss">
.dialog-content {
  padding: 16px 10px 10px;
  width: 360px;
  background-color: var(--el-bg-color);
  font-size: 14px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: var(--el-text-color-primary);
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.setting-label {
  font-weight: 500;
  white-space: nowrap;
  width: 80px;
}

.setting-slider {
  flex: 1;
  margin-right: 10px;
}

.setting-value {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.setting-input {
  width: 140px;
}

.dialog-footer {
  text-align: right;
}
</style>