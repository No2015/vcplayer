<template>
  <div class="dialog-content">
    <div class="dialog-title">
      <span>数据切换</span>
      <span class="task-name" :title="taskName">{{ taskName }}</span>
    </div>
    <div class="data-switch-list">
      <div
        v-for="(item, index) in playerData.fileList"
        :key="index"
        class="data-item"
        :class="{ 'selected': playerData.selectedFileIndex === index }"
        @click="handleItemClick(index)"
      >
        <div class="file-name">{{ item.fileName }}</div>
        <div class="review-percent">{{ item.reviewedPercent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { playerDataStore } from '../hooks'

// 全局数据
const playerData = playerDataStore()

// 点击某一项
const handleItemClick = (index: number) => {
  if (playerData.selectedFileIndex === index) {
    return;
  }
  const selectedItem = playerData.fileList[index]
  playerData.selectedFileIndex = index || 0
  playerData.nginxPath = selectedItem.url
  playerData.fileType = selectedItem.fileType
  playerData.fps = selectedItem.frameRate || 24
  playerData.isPlaying = false;
  playerData.seekTo = selectedItem.checkDuration / 1e3 || 0.001
}

const taskName = computed(() => {
  return playerData.taskData.taskName
})

</script>

<style scoped lang="scss">
.dialog-content {
  padding: 10px;
  width: 360px;
  background-color: var(--el-bg-color);
  font-size: 14px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: var(--el-text-color-regular);
  .dialog-title {
    border-bottom: 1px solid var(--el-border-color);
    padding-bottom: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--el-text-color-primary);
    .task-name {
      color: #999;
      max-width: calc(100% - 70px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.data-switch-list {
  max-height: 400px;
  overflow-y: auto;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:last-child {
    margin-bottom: 0px;
  }
}

.data-item:hover {
  background-color: var(--el-bg-color-page);
}

.data-item.selected {
  background-color: var(--el-bg-color-page);
  color: var(--el-color-primary);
}

.data-item .file-name {
  font-weight: 500;
  word-break: break-all;
  flex: 1;
}

.data-item .review-percent {
  font-size: 14px;
  margin-left: 20px;
  white-space: nowrap;
}

.dialog-footer {
  text-align: right;
}
</style>