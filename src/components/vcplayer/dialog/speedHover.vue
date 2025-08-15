<template>
  <div class="dialog-content">
    <div class="speed-control">
      <label for="playback-slider" class="speed-label">播放速度：</label>
      <el-slider
        id="playback-slider"
        v-model="playerData.speed"
        :min="0.1"
        :max="10"
        :step="0.1"
        :format-tooltip="formatTooltip"
        show-input
        class="speed-slider"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { playerDataStore } from '../hooks'

// 全局数据
const playerData = playerDataStore()

// 格式化滑块提示（Tooltip）的显示内容
const formatTooltip = (val: number) => {
  return `${val.toFixed(1)}x`
}

</script>

<style scoped lang="scss">
/* 弹窗内容区域样式 */
.dialog-content {
  padding: 10px;
  width: 360px;
  background-color: var(--el-bg-color);
  font-size: 14px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: var(--el-text-color-primary);
}

/* 播放速度控制区域的布局 */
.speed-control {
  display: flex;
  align-items: center;
}

/* 播放速度标签样式 */
.speed-label {
  font-weight: 500;
  white-space: nowrap;
}

/* 滑块组件样式 */
.speed-slider {
  flex: 1;
}

/* 当前速度值显示样式 */
.speed-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
  min-width: 40px; /* 确保显示宽度，避免跳动 */
  text-align: center;
}

</style>