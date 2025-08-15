import { defineStore } from 'pinia'

// 定义数据项类型
export type FileData = {
  url: string // 文件的 URL
  fileId: number // 文件的唯一标识符
  fileName: string
  filePath: string // 文件夹路径
  fileType: string // 文件类型，可能是 'image' 或 'video'
  reviewedPercent: number // 复核进度
  checkDuration: number // 已复核时长
  stayDuration: number | null // 用户停留时长
  frameRate: number // 帧率
  duration: number // 文件总时长
  frames: number // 总帧数
}

/**
 * 播放器的数据仓库
 */
export const playerDataStore = defineStore('playerData', {
  state: () => {
    const fps = 24; // 假设的帧率
    return {
      resize: 0, // 是否需要重新调整大小

      // 播放器状态
      isPlaying: false, // 播放中
      playRate: 0, // 播放百分比
      duration: 0, // 时长
      rotate: 0, // 旋转角度
      seekTo: 0, // 跳转到秒数
      quickPlayNext: 0, // 快速播放 快进
      quickPlayPrev: 0, // 快速播放 快退
      download: false, // 是否下载
      fps, // 帧率
      frameNumber: 0, // 当前播放帧
      speed: 1.0, // 播放速度，初始为 1.0

      // 播放器设置
      showTool: false, // 是否显示工具栏
      toolData: {
        contrast: 100, // 对比度
        brightness: 100, // 亮度
        frameStep: 1, // 帧步长
      }, // 工具数据

      // 播放器弹窗状态
      openSpeed: false, // 是否打开播放速度设置
      openTool: false, // 是否打开工具设置
      openSetting: false, // 是否打开工具设置
      openDefectConfirm: false, // 是否打开缺陷确认弹窗
      openDefectDelete: false, // 是否打开缺陷删除弹窗
      openHelp: false, // 是否打开帮助弹窗
      openFile: false, // 是否打开文件弹窗

      // 缺陷&图片数据
      defectPosList: [] as any[], // 缺陷位置列表
      showDefect: true, // 是否显示缺陷
      isAdd: false, // 是否添加缺陷
      defectData: {}, // 缺陷数据
      selectedFileIndex: 0, // 当前选中的文件索引
      fileList: [] as FileData[], // 文件列表
      taskData: {} as any, // 任务数据
      isReviewImg: false, // 是否正在查看单张图片
      // fileType: 'image', // 文件类型 视频video & 图片image
      // nginxPath: 'http://192.168.5.62:8284/image/1948297337942237185/1753345264915.jpg', // 图片路径
      fileType: 'video',
      nginxPath: '',
      // nginxPath: 'http://192.168.5.62:8284/video/%E4%B8%8A%E8%B7%A8%E6%A1%A5%E6%B5%8B%E8%AF%95/2025.01.20%E6%B2%AA%E8%93%89%E7%BA%BF%E4%B8%8A%E8%A1%8C%E6%B7%AE%E5%8F%A3%E5%8D%97-%E7%A7%AF%E9%87%91%E5%8D%97%28%E8%A7%86%E9%A2%91%E6%95%88%E6%9E%9CA%E6%B8%A9%E5%BA%A613%C2%B0%29_%E5%8F%A4%E4%B8%96%E6%98%BE.MP4', // 图片路径
    }
  },
  getters: {

  },
  actions: {

  },
})
