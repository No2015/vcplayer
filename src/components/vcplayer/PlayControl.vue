<template>
  <div class="tool-control" v-if="playerData.showTool">
    <div class="control-btn-box">
      <el-tooltip
        effect="dark"
        content="工具"
        placement="bottom"
        :append-to="appendToEl"
      >
        <div class="control-btn tool-btn" @click="onClickBtn('tool-open')"></div>
      </el-tooltip>
      <div class="control-btn-hover" style="right: 44px; top: 0px;" v-if="playerData.openTool">
        <ToolHover :hideTool="true" />
      </div>
    </div>
  </div>
  <div class="right-control">
    <div class="slider-control">
      <template v-if="isFullScreen">
        <el-tooltip
          effect="dark"
          :content="closedControl ? '展开' : '收起'"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn closeed-btn" :class="{'closeed': closedControl}" @click="onClickBtn('closeed')"></div>
        </el-tooltip>
      </template>
      <div class="slider-tips" v-show="showTips" :style="timeTipsStyle">{{ timeTips.time }}</div>
      <el-slider 
        class="my-slider" 
        :step="0.001"
        :show-tooltip="false" 
        v-model="rate" 
        @change="onPlayTo" 
        @input="onPlayInput" 
        @mousemove.native="mousemoveSlider"
        @mouseleave.native="showTips = false"
        :marks="marks"
      />
      <div class="file-name">{{ fileName }}</div>
      <div class="play-time">{{ timeStr }}/{{ durationStr }}</div>
    </div>
    <div v-if="!closedControl" class="bottom-control">
      <div class="bottom-control-item bottom-control-1">
        <div class="control-btn-box">
          <el-tooltip
            effect="dark"
            content="数据切换"
            placement="top"
            :append-to="appendToEl"
          >
            <div class="control-btn filter-btn" @click="onClickBtn('file-open')"></div>
          </el-tooltip>
          <div class="control-btn-hover" style="left: 0; bottom: 44px;" v-if="playerData.openFile">
            <FileHover />
          </div>
        </div>
        <div class="control-btn-box">
          <el-tooltip
            effect="dark"
            content="设置"
            placement="top"
            :append-to="appendToEl"
          >
            <div class="control-btn setting-btn" @click="onClickBtn('setting-open')"></div>
          </el-tooltip>
          <div class="control-btn-hover" style="left: 0; bottom: 44px;" v-if="playerData.openSetting">
            <ToolHover />
          </div>
        </div>
        <div class="control-btn-box">
          <el-tooltip
            effect="dark"
            content="速度"
            placement="top"
            :append-to="appendToEl"
          >
            <div class="control-btn speed-btn" @click="onClickBtn('speed-open')"></div>
          </el-tooltip>
          <div class="control-btn-hover" style="left: 0; bottom: 44px;" v-if="playerData.openSpeed">
            <SpeedHover />
          </div>
        </div>
      </div>
      <div class="bottom-control-item bottom-control-2">
        <el-tooltip
          effect="dark"
          content="快退"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn prev-btn" @click="onClickBtn('prev')"></div>
        </el-tooltip>
        <template v-if="!playerData.isPlaying">
          <el-tooltip
            effect="dark"
            content="播放"
            placement="top"
            :append-to="appendToEl"
          >
            <div class="control-btn play-btn" @click="onClickBtn('play')"></div>
          </el-tooltip>
        </template>
        <template v-else>
        <el-tooltip
          effect="dark"
          content="暂停"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn pause-btn" @click="onClickBtn('pause')"></div>
        </el-tooltip>
        </template>
        <el-tooltip
          effect="dark"
          content="快进"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn next-btn" @click="onClickBtn('next')"></div>
        </el-tooltip>
      </div>
      <div class="bottom-control-item bottom-control-3">
        <el-tooltip
          effect="dark"
          :content="(!playerData.showDefect ? '显示' : '隐藏') + '缺陷'"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn" @click="onClickBtn('show-defect')">
            <el-icon color="#ffffffee" v-if="playerData.showDefect"><View /></el-icon>
            <el-icon color="#ffffffee" v-else><Hide /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          content="新增缺陷"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn confirmDefect-btn" :class="{'active': playerData.isAdd}" @click="onClickBtn('defect-confirm-open')"></div>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="downloading ? '下载中...' : '下载'"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn download-btn" :class="{'downloading': downloading}" @click="onClickBtn('download')"></div>
        </el-tooltip>
        <template v-if="!isFullScreen">
        <el-tooltip
          effect="dark"
          content="全屏"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn fullScreen-btn" @click="onClickBtn('fullScreen')"></div>
        </el-tooltip>
        </template>
        <template v-else>
        <el-tooltip
          effect="dark"
          content="退出全屏"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn fullScreenShrink-btn" @click="onClickBtn('fullScreenShrink')"></div>
        </el-tooltip>
        </template>
        <el-tooltip
          effect="dark"
          content="帮助"
          placement="top"
          :append-to="appendToEl"
        >
          <div class="control-btn help-btn" @click="onClickBtn('help-open')"></div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fromSeconds } from './utils';
import { playerDataStore } from './hooks';
import SpeedHover from './dialog/speedHover.vue';
import ToolHover from './dialog/toolHover.vue';
import FileHover from './dialog/fileHover.vue';

// 全局数据
const playerData = playerDataStore();

// 临时变量不需要持久化
const isFullScreen = ref(false);
const closedControl = ref(false);
const rate = ref(1);
const timeStr = ref('00:00:00');
const showTips = ref(false);
const timeTips = ref({
  time: '00:00:00',
  x: 0,
});
const downloading = ref(false);
// 标记
const marks = computed(() => {
  const file = playerData.fileList[playerData.selectedFileIndex]
  const marks = {} as any
  const list = playerData.defectPosList.filter((defect: any) => {
    return file.fileId === defect.fileId
  })
  list.forEach((defect: any) => {
    const rate = parseFloat(((defect.frameNumber || 0) / (playerData.duration * playerData.fps) * 100).toFixed(2));
    marks[rate] = {
      style: {
      }
    }
  });
  // console.log('>>> marks', marks, list, playerData.duration, playerData.fps)
  return marks
})
const timeTipsStyle = computed(() => {
  return {
    left: `${timeTips.value.x}px`,
  }
})
// 临时变量
let _playTime = -1;

// 挂载元素
const appendToEl = computed(() => {
  if (isFullScreen.value) {
    return document.querySelector('#vcplayer-fullscreen');
  }
  return null;
})
// 播放时间字符串
const durationStr = computed(() => {
  return fromSeconds(playerData.duration);
})
// 当前文件名
const fileName = computed(() => {
  const file = playerData.fileList[playerData.selectedFileIndex]
  return file.fileName || ''
})

// 点击按钮
function onClickBtn(type: string) {
  console.log('>>> type', type)
  switch (type) {
    case 'file-open':
      if (!playerData.openFile) {
        setTimeout(() => {
          playerData.openFile = true;
        }, 0);
      }
      addListener();
      break;
    case 'help-open':
      playerData.openHelp = true;
      break;
    case 'setting-open':
      if (!playerData.openSetting) {
        setTimeout(() => {
          playerData.openSetting = true;
        }, 0);
      }
      addListener();
      break;
    case 'tool-open':
      if (!playerData.openTool) {
        setTimeout(() => {
          playerData.openTool = true;
        }, 0);
      }
      addListener();
      break;
    case 'defect-confirm-open':
      playerData.isPlaying = false
      playerData.isAdd = !playerData.isAdd;
      break;
    case 'speed-open':
      if (!playerData.openSpeed) {
        setTimeout(() => {
          playerData.openSpeed = true;
        }, 0);
      }
      addListener();
      break;
    case 'fullScreen':
    case 'fullScreenShrink':
      fullScreen();
      break;
    case 'closeed':
      closedControl.value = !closedControl.value;
      break;
    case 'download':
      if (downloading.value) {
        return;
      }
      playerData.download = true;
      downloading.value = true;
      setTimeout(() => {
        playerData.download = false;
      }, 0);
      setTimeout(() => {
        downloading.value = false;
      }, 1000);
      break;
    case 'play':
      playerData.isPlaying = true;
      playerData.isAdd = false;
      break;
    case 'pause':
      playerData.isPlaying = false;
      break;
    case 'next':
        playerData.quickPlayNext++;
      break;
    case 'prev':
        playerData.quickPlayPrev++;
      break;
    case 'show-defect':
      playerData.showDefect = !playerData.showDefect;
      break;
    default:
      break;
  }
}

function addListener() {
  setTimeout(() => {
    document.addEventListener('click', onClose);
  }, 0);
}

function onClose(event: any) {
  let targetElement = event.target;
  let controlBtnHoverAncestor = targetElement.closest('.control-btn-hover');
  if (controlBtnHoverAncestor) {
    return;
  }
  playerData.openFile = false;
  playerData.openSetting = false;
  playerData.openTool = false;
  playerData.openSpeed = false;
  document.removeEventListener('click', onClose);
}

// 拖拽结束
function onPlayTo() {
  playerData.seekTo = _playTime / 100 * playerData.duration;
  _playTime = -1;
  setTimeout(() => {
    playerData.seekTo = 0
  }, 0);
}

// 拖拽响应修改时间
function onPlayInput(value: number) {
  const time = parseFloat((playerData.duration * value / 100).toFixed(0));
  _playTime = value;
  timeStr.value = fromSeconds(time);
}

// 全屏 & 退出全屏
function fullScreen() {
  if (!isFullScreen.value) {
    const el = document.querySelector('#vcplayer-fullscreen')
    if (el) {
      el.requestFullscreen();
      document.onfullscreenchange = () => {
        isFullScreen.value = !isFullScreen.value
        if (isFullScreen.value) {
          closedControl.value = true
        } else {
          closedControl.value = false
        }
      }
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// 更新复核进度
function updateCheckDuration() {
  const file = playerData.taskData.fileList[playerData.selectedFileIndex]
  const s = playerData.playRate / 100 * playerData.duration
  const checkDuration = Math.ceil(s * 1000);

  // console.log(`>>> 更新复核: ${checkDuration}ms, 已复核：${file.checkDuration}ms, 总时长${file.duration}ms`)
  if (checkDuration > file.checkDuration && checkDuration < file.duration) {
    file.checkDuration = checkDuration;
  }
}

// 鼠标移动到进度条上
function mousemoveSlider(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target?.className === 'el-slider__runway' || target.className === 'el-slider__bar') {
    // const width = event.target.closest('.my-slider')?.getBoundingClientRect()?.width || 0
    // timeTips.value.time = fromSeconds((event.offsetX / width) * playerData.duration);
    // showTips.value = true;
    // timeTips.value.x = event.offsetX - 20; // 调整位置
    showTips.value = false;
  } else if (target?.classList?.contains('el-slider__marks-stop')) {
    const width = target.closest('.my-slider')?.getBoundingClientRect()?.width || 0
    const rate = parseFloat(target.style.left)
    timeTips.value.time = fromSeconds(rate / 100 * playerData.duration);
    timeTips.value.x = rate / 100 * width - 20; // 调整位置
    showTips.value = true;
  } else {
    showTips.value = false;
  }
}

// 监听播放进度变化，如果正在手动调整进度条则不渲染
watch(() => playerData.playRate, (newVal) => {
  if (_playTime < 0 && !isNaN(newVal)) {
    const s = newVal / 100 * playerData.duration
    rate.value = newVal;
    timeStr.value = fromSeconds(s);
    updateCheckDuration();
  }
});

</script>

<style scoped lang="scss">
.control-btn-box {
  position: relative;
  .control-btn-hover {
    position: absolute;
    z-index: 999;
  }
}
.control-btn {
  width: 34px;
  height: 34px;
  line-height: 40px;
  text-align: center;
  background: no-repeat center center / 18px 18px;
  cursor: pointer;
  // opacity: 0.8;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    // opacity: 1;
  }

  &.filter-btn {
    background-image: url(./assets/filter-btn.png);
  }
  &.setting-btn {
    background-image: url(./assets/setting-btn.png);
  }
  &.speed-btn {
    background-image: url(./assets/speed-btn.png);
  }
  &.prev-btn {
    background-image: url(./assets/prev-btn.png);
  }
  &.play-btn {
    background-image: url(./assets/play-btn.png);
  }
  &.pause-btn {
    background-image: url(./assets/pause-btn.png);
  }
  &.next-btn {
    background-image: url(./assets/next-btn.png);
  }
  &.confirmDefect-btn {
    background-image: url(./assets/confirm-defect-btn.png);
  }
  &.download-btn {
    background-image: url(./assets/download-btn.png);
  }
  &.fullScreen-btn {
    background-image: url(./assets/full-screen-btn.png);
  }
  &.fullScreenShrink-btn {
    background-image: url(./assets/full-screen-shrink-btn.png);
  }
  &.help-btn {
    background-image: url(./assets/more-btn.png);
  }
  &.tool-btn {
    background-image: url(./assets/tool-btn.png);
  }
  &.play-state-btn {
    background: url(./assets/play-state-btn.png) no-repeat center center / 28px 28px;
  }
  &.closeed-btn {
    background-image: url(./assets/closeed-btn.png);
    transform: rotate(180deg);
    &.closeed {
      transform: rotate(0deg);
    }
  }
  &.active {
    background-color: rgba(64, 158, 255, 0.4);
  }
  &.downloading {
    background: url(./assets/loading.gif) no-repeat center center / 28px 28px;
  }
}

.play-state {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  .play-state-btn {
    pointer-events: auto;
    opacity: 1;
    transform: scale(1);
    transition: all 0s ease-in-out;
    &.hide {
      opacity: 0;
      pointer-events: none;
      transform: scale(2);
      transition: all 0.3s ease-in-out;
    }
  }
}

.tool-control {
  position: absolute;
  right: 25px;
  top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-control {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 8px;
  position: relative;
  pointer-events: auto;

  .my-slider {
    flex: 1;
    --el-slider-height: 4px;
    --el-slider-button-size: 12px;
    --el-slider-button-wrapper-offset: -16px;
    // --el-slider-button-wrapper-size: 
  }

  ::v-deep {
    .el-slider__runway {
      background-color: rgba(255, 255, 255, 0.2);
    }
    .el-slider__button {
      background-color: var(--el-slider-main-bg-color);
      // background-color: #4086FF;
    }
    .el-slider__stop {
      background-color: red
    }
  }

  .file-name {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    position: absolute;
    left: 8px;
    top: 32px;
    max-width: calc(100% - 160px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .play-time {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    position: absolute;
    right: 8px;
    top: 32px;
  }

  .slider-tips {
    color: rgba(255, 255, 255, 0.8);
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 0px;
    font-size: 12px;
    position: absolute;
    padding: 0 4px;
    left: 0px;
    top: 0px;
  }

}

.right-control {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  pointer-events: none;

  .bottom-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: auto;

    .bottom-control-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 33.33%;
      column-gap: 8px;

      &.bottom-control-1 {
        justify-content: flex-start;
      }
      
      &.bottom-control-3 {
        justify-content: flex-end;
      }

    }
  }
}
</style>