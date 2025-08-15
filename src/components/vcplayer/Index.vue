<template>
    <div class="vcplayer-box" id="vcplayer-fullscreen">
      <template v-if="playerData.nginxPath">
        <PlayView />
        <PlayControl />
        <DefectConfirmDialog />
        <DefectDeleteDialog />
        <HelpDialog />
      </template>
    </div>
</template>

<script setup lang="ts">
import DefectConfirmDialog from './dialog/defectConfirmDialog.vue';
import DefectDeleteDialog from './dialog/defectDeleteDialog.vue';
import HelpDialog from './dialog/helpDialog.vue';
import PlayControl from './PlayControl.vue';
import PlayView from './PlayView.vue';
import { playerDataStore } from './hooks';

// 全局数据
const playerData = playerDataStore();


</script>

<style scoped lang="scss">
.vcplayer-box {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  ::v-deep .play-state {
    opacity: 0;
  }
   &:hover ::v-deep {
    .play-state {
      opacity: 1;
    }
  }
  
}
</style>