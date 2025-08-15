<template>
  <div class="player-view" :style="{cursor: playerData.isAdd ? 'crosshair' : ''}">
    <canvas
      :style="filterStyle" 
      ref="canvas"
      class="player-canvas"
      @mousedown="mousedownFn"
      @mousemove="mousemoveFn"
      @mouseup="mouseupFn"
      @wheel="wheelFn"
      @mouseout="mouseoutFn"
      @dblclick="dblclickFn"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { useCanvasDraw } from './useCanvasDraw'
import { playerDataStore } from './hooks'
import { computed, onUnmounted } from 'vue'

// 全局数据
const playerData = playerDataStore()


const vcplayer = window.vcplayer = useCanvasDraw()

const {
  canvas,
  mousedownFn,
  mousemoveFn,
  mouseupFn,
  mouseoutFn,
  wheelFn,
  dblclickFn,
  getDataURL,
} = vcplayer

onUnmounted(() => {
  playerData.isReviewImg = false;
  playerData.defectPosList = []
  playerData.nginxPath = ''
  playerData.seekTo = 0.001
  window.vcplayer = null
})

const filterStyle = computed(() => {
  if (playerData.isReviewImg && playerData.fileType === 'image') {
    return 'filter: brightness(100%) contrast(100%);'
  }
  return `filter: brightness(${playerData.toolData.brightness}%) contrast(${playerData.toolData.contrast}%);`
})

defineExpose({ getDataURL })
</script>

<style scoped lang="scss">
.player-view {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
  .player-canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}
</style>