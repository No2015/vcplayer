<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Index from './vcplayer/Index.vue'
import { playerDataStore } from './vcplayer/hooks'

defineProps<{}>()

const playerData = playerDataStore()

onMounted(() => {
  // 初始化播放器数据
  playerData.taskData = {
    deadline: "2025-08-15 20:41:00",
    id: 50,
    lineDirection: 0,
    lineId: 2,
    taskName: "2025-08-13_成雅_上行_30℃",
    fileList: [
      {
        "url": "/assets/20250710170210.mp4",
        "fileId": 1284,
        "fileName": "20250710170210.mp4",
        "duration": 302450,
        "filePath": "/assets/",
        "checkDuration": 0,
        "stayDuration": null,
        "frames": 6049,
        "frameRate": 20,
        "fileType": "video",
        "reviewedPercent": 0,
      },
      {
        "url": "/assets/frag_bunny.mp4",
        "fileId": 1280,
        "fileName": "frag_bunny.mp4",
        "duration": 60186,
        "filePath": "/assets/",
        "checkDuration": 0,
        "stayDuration": null,
        "frames": 1440,
        "frameRate": 24,
        "fileType": "video",
        "reviewedPercent": 0,
      }
    ]
  }
  playerData.fileList = playerData.taskData.fileList
  if (!playerData.defectPosList.length) {
    playerData.defectPosList = [
      {
        "lineId": 2,
        "lineDirection": "0",
        "stationId": 4,
        "pillarNum": "3",
        "km": "1",
        "deptId": "",
        "defectType": "上跨桥",
        "levels": "0",
        "defectLocation": "1",
        "defectDesc": "2",
        "extraParam": "3",
        "remark": "4",
        "xmax": 218,
        "xmin": 43,
        "ymax": 143,
        "ymin": 27,
        "deptName": "双流车间",
        "taskId": 50,
        "fileId": 1284,
        "file": "",
        "frameNumber": 750
      },
      {
        "lineId": 2,
        "lineDirection": "0",
        "stationId": 4,
        "pillarNum": "3",
        "km": "1",
        "deptId": "",
        "defectType": "上跨桥",
        "levels": "0",
        "defectLocation": "1",
        "defectDesc": "2",
        "extraParam": "3",
        "remark": "4",
        "xmax": 100,
        "xmin": 10,
        "ymax": 200,
        "ymin": 20,
        "deptName": "双流车间",
        "taskId": 50,
        "fileId": 1280,
        "file": "",
        "frameNumber": 60
      }
    ]
  }
  playerData.selectedFileIndex = 0
  const file = playerData.fileList[0]
  playerData.nginxPath = file.url
  playerData.fileType = file.fileType
  playerData.fps = file.frameRate
})
</script>

<template>
  <div class="content">
    <Index />
  </div>
</template>

<style scoped lang="scss">
.content {
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
}
</style>
