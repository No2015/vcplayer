import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { playerDataStore } from './hooks'

export function useCanvasDraw() {
  // 全局数据
  const playerData = playerDataStore()
  // 画布ref、图片、视频元素
  const canvas = ref()
  const img = new Image()
  const video = document.createElement('video')
  // 允许加载跨域视频、图片
  img.crossOrigin = "anonymous"
  video.crossOrigin = 'anonymous';

  // 全局状态管理
  const state = {
    // 画布缩放、平移相关
    times: 1,
    scale: 1,
    MaxScale: 8,
    scaleStep: 0.1,
    MinScale: 0.5,
    offset: { x: 0, y: 0 },
    // 加载状态
    loaded: false,
    // 选中缺陷id
    selectedDefectId: undefined,
    // 帧动画
    animationFrame: 0,
    // 鼠标位置、状态
    beginPos: { x: 0, y: 0 },
    movePos: { x: 0, y: 0 },
    mouseState: { mousedown: false, mousemove: false, mouseup: false },
    // 画布上下文
    ctx: null as CanvasRenderingContext2D | null,
  }

  // 初始化播放器状态
  function initPlayState() {
    playerData.isPlaying = false
    playerData.isAdd = false
    playerData.openDefectConfirm = false
    playerData.openSpeed = false
    playerData.openTool = false
    playerData.openHelp = false
    playerData.openFile = false
    playerData.openDefectDelete = false
    playerData.playRate = 0
    playerData.quickPlayNext = 0
    playerData.quickPlayPrev = 0
    playerData.download = false;
    playerData.showDefect = true;

    Object.assign(state, {
      scale: 1,
      MaxScale: 8,
      scaleStep: 0.1,
      MinScale: 0.5,
      offset: { x: 0, y: 0 },

      loaded: false,
    })
  }

  // 初始化资源
  function initResourceFn() {

    initPlayState();
    if (state.ctx) {
      clearCanvas(canvas.value, state.ctx)
    }
    if (!playerData.nginxPath) {
      return;
    }
    initCanvs();
    const nginxPath = playerData.nginxPath.replace(/#/g, '%23')
    if (!isVideoElement()) {
      img.src = nginxPath
      img.onload = () => {
        if (!state.loaded) {
          state.loaded = true
          initTimes()
        }
        renderResource()
      }
      img.onerror = () => {
        console.error('图片加载失败，请检查路径或网络连接！')
      }
    } else {
      video.src = nginxPath
      video.currentTime = playerData.seekTo || 0.001
      video.playbackRate = playerData.speed || 1 // 设置默认播放速度
      video.oncanplay = () => {
        if (!state.loaded) {
          state.loaded = true
          playerData.duration = video.duration
          initTimes()
        }
        renderResource()
        if (playerData.isPlaying) {
          return;
        }
        // 防止当前帧视频未渲染，需要循环渲染多次
        cancelAnimationFrame(state.animationFrame)
        let num = 0
        function animation() {
          if (num >= 5) {
            return;
          }
          num++
          state.animationFrame = requestAnimationFrame(animation)
          renderResource()
        }
        animation()
      }
      video.onended = () => {
        cancelAnimationFrame(state.animationFrame)
        playerData.isPlaying = false
      }
      video.ontimeupdate = () => {
        const rate = video.currentTime / video.duration
        playerData.playRate = rate * 100
      }
      video.onerror = () => {
        console.error('视频加载失败，请检查路径或网络连接！')
      }
    }
  }

  // 尺寸变化重绘
  function resizeResourceFn() {
    initCanvs()
    initTimes()
    renderResource()
  }

  // 初始化画布尺寸
  function initCanvs() {
    state.times = 1
    if (!canvas.value) return
    const div = canvas.value.parentElement
    if (!div) return
    state.ctx = canvas.value.getContext('2d')
    canvas.value.width = div.offsetWidth
    canvas.value.height = div.offsetHeight
  }

  // 初始化缩放比例
  function initTimes() {
    if (!canvas.value) return

    const { WIDTH, HEIGHT } = getSize();
    const scaleX = canvas.value.width / WIDTH
    const scaleY = canvas.value.height / HEIGHT
    state.times = Math.min(scaleX, scaleY)
    // console.log('>>> 资源尺寸:', WIDTH, HEIGHT, '画布尺寸:', canvas.value.width, canvas.value.height, '缩放倍数:', state.times);
  }

  // 资源渲染入口
  function renderResource() {
    if (state.ctx && state.loaded) {
      clearCanvas(canvas.value, state.ctx)
      renderImgVideo(state.ctx)
    }
  }

  // 资源上图
  function renderImgVideo(ctx: CanvasRenderingContext2D) {
    const rotate = (playerData.rotate || 0) % 360;
    const rad = rotate * Math.PI / 180;
    const canvasWidth = canvas.value.width;
    const canvasHeight = canvas.value.height;

    // 画布中心
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    // 旋转画布，画图片和线框
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    const { WIDTH, HEIGHT } = getSize();
    const drawW = WIDTH * state.times * state.scale;
    const drawH = HEIGHT * state.times * state.scale;
    ctx.drawImage(
      isVideoElement() ? video : img,
      0, 0,
      WIDTH, HEIGHT,
      -drawW / 2 + state.offset.x,
      -drawH / 2 + state.offset.y,
      drawW,
      drawH
    );

    // 更新当前播放帧
    playerData.frameNumber = getCurrentFrame()

    // 画缺陷框，并记录左上角（当前是旋转后的坐标系、以中心为原点）
    const defectPosList = getDefectPosList();
    const textPositions: { x: number, y: number, text: string }[] = [];
    defectPosList.forEach((it: any) => {
      // 计算未旋转时的四角
      const x1 = it.xmin * state.times * state.scale + state.offset.x - drawW / 2;
      const y1 = it.ymin * state.times * state.scale + state.offset.y - drawH / 2;
      const x2 = it.xmax * state.times * state.scale + state.offset.x - drawW / 2;
      const y2 = it.ymax * state.times * state.scale + state.offset.y - drawH / 2;

      // 旋转四角，变为全局坐标
      const corners = [
        rotatePoint(x1, y1, 0, 0, rad),
        rotatePoint(x2, y1, 0, 0, rad),
        rotatePoint(x2, y2, 0, 0, rad),
        rotatePoint(x1, y2, 0, 0, rad)
      ].map(c => ({
        x: c.x + canvasWidth / 2,
        y: c.y + canvasHeight / 2
      }));

      // 1. 找到y最小
      const minY = Math.min(...corners.map(c => c.y));
      // 2. 过滤出y几乎等于minY的点（防止浮点误差，允许0.5像素容差）
      const topCandidates = corners.filter(c => Math.abs(c.y - minY) < 0.5);
      // 3. 从这些点中取x最小的
      const topLeft = topCandidates.reduce((a, b) => (a.x < b.x ? a : b));

      textPositions.push({
        x: topLeft.x,
        y: topLeft.y,
        text: it.defectType || ''
      });

      // 画框（在旋转画布坐标系下）
      ctx.lineWidth = 1 * state.scale;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // 填充选中
      if (state.selectedDefectId && it.id === state.selectedDefectId) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,0,0,0.3)';
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.restore();
      }
    });

    ctx.restore();

    // 在全局坐标系下画文字
    ctx.save();
    ctx.font = 'bold ' + state.scale * 14 + 'px "黑体" ';
    ctx.fillStyle = 'blue';
    const offset = 3 * state.scale;
    textPositions.forEach(tp => {
      ctx.fillText(tp.text, tp.x, tp.y - offset);
    });
    ctx.restore();
  }

  // 获取缺陷列表数据
  function getDefectPosList() {
    if (!playerData.showDefect) {
      return []
    }
    const file = playerData.fileList[playerData.selectedFileIndex]
    const defectPosList = (playerData.defectPosList || []).filter(defect => {
      if (playerData.isReviewImg && !isVideoElement()) {
        return defect.xmin && defect.xmax && defect.ymax && defect.ymin
      }
      return file.fileId === defect.fileId && defect.frameNumber == playerData.frameNumber && defect.xmin && defect.ymax && defect.ymin;
    });
    return defectPosList
  }

  // 判断是否视频
  function isVideoElement() {
    return playerData.fileType === 'video'
  }

  // 清空画布
  function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  //---- 鼠标事件相关
  // 鼠标按下
  function mousedownFn(e: MouseEvent) {
    document.onselectstart = ev => ev.preventDefault()
    e.stopPropagation()
    e.preventDefault()
    if (!playerData.nginxPath) {
      return;
    }
    if (isVideoElement() && playerData.isPlaying) {
      playerData.isPlaying = false
    }
    state.mouseState.mousedown = true
    state.beginPos.x = e.offsetX
    state.beginPos.y = e.offsetY
    state.movePos.x = e.offsetX
    state.movePos.y = e.offsetY
  }

  // 鼠标移动
  function mousemoveFn(e: MouseEvent) {
    if (!state.mouseState.mousedown) return
    state.movePos.x = e.offsetX
    state.movePos.y = e.offsetY
    if (!playerData.isAdd) {
      // 拖拽时的位移矢量
      let dx = e.offsetX - state.beginPos.x
      let dy = e.offsetY - state.beginPos.y

      // 记录新起点（连续拖动）
      state.beginPos.x = e.offsetX
      state.beginPos.y = e.offsetY

      // 根据旋转角逆旋转位移
      const rotate = (playerData.rotate || 0) % 360;
      const rad = rotate * Math.PI / 180
      const cos = Math.cos(-rad)
      const sin = Math.sin(-rad)
      const rdx = dx * cos - dy * sin
      const rdy = dx * sin + dy * cos

      state.offset.x += rdx
      state.offset.y += rdy

      // 后续边界判定和重绘与原来一样
      renderResource()
    } else {
      renderCurrentRect()
    }
  }

  // 鼠标松开
  function mouseupFn() {
    if (state.mouseState.mousedown) {
      document.onselectstart = null
      initMouseState()
      if (playerData.isAdd) computePos()
    }
  }

  // 鼠标离开
  function mouseoutFn() {
    if (state.mouseState.mousedown && playerData.isAdd) {
      initMouseState()
      resetFn()
    }
  }

  // 鼠标滚轮
  function wheelFn(e: any) {
    e.preventDefault()
    if (!playerData.nginxPath) {
      return;
    }
    let scale = state.scale
    if (scale > 10) {
      state.scaleStep = 4
    } else if (scale > 8) {
      state.scaleStep = 2
    } else if (scale > 4) {
      state.scaleStep = 1
    } else if (scale > 2) {
      state.scaleStep = 0.5
    } else {
      state.scaleStep = 0.1
    }

    let newScale = scale
    if (e.wheelDelta > 0) {
      newScale += state.scaleStep
      newScale = Math.min(newScale, state.MaxScale)
    }
    if (e.wheelDelta < 0) {
      newScale -= state.scaleStep
      newScale = Math.max(newScale, state.MinScale)
    }
    newScale = +newScale.toFixed(2)
    if (newScale === scale) return // 没变化

    const canvasEl: HTMLCanvasElement = canvas.value
    const mouseX = e.offsetX
    const mouseY = e.offsetY
    const centerX = canvasEl.width / 2
    const centerY = canvasEl.height / 2

    // 关键部分：以鼠标为中心调整 offset
    // 1. 当前鼠标在图片坐标（考虑 offset/scale/rotation）
    // 先转到画布中心为原点
    let x = mouseX - centerX
    let y = mouseY - centerY
    const rotate = (playerData.rotate || 0) % 360;
    const rad = rotate * Math.PI / 180
    // 逆旋转
    const cos = Math.cos(-rad)
    const sin = Math.sin(-rad)
    let rx = x * cos - y * sin
    let ry = x * sin + y * cos

    // 再加回 offset
    let before_x = rx - state.offset.x
    let before_y = ry - state.offset.y

    // 2. 缩放后 offset 需要让鼠标位置指向图片同一个点
    // 缩放前后，鼠标所指图片点等价
    // 新 offset = 鼠标旋转坐标 - (原图片点 * newScale / scale)
    state.offset.x += (1 - newScale / scale) * before_x
    state.offset.y += (1 - newScale / scale) * before_y

    state.scale = newScale
    renderResource()
  }

  // 鼠标双击
  function dblclickFn(e: MouseEvent) {
    if (playerData.isReviewImg && !isVideoElement()) {
      return;
    }
    if (!playerData.nginxPath) {
      return;
    }
    // 1. 画布坐标转图片坐标
    const { x, y } = getImageCoordsFromCanvas(e.offsetX, e.offsetY);

    // 2. 遍历缺陷框，判断是否命中
    let found: any = null; // 假设缺陷数据有 id 字段
    const defectPosList = getDefectPosList();
    for (const it of defectPosList) {
      if (
        x >= it.xmin &&
        x <= it.xmax &&
        y >= it.ymin &&
        y <= it.ymax
      ) {
        found = it;
        break;
      }
    }
    // 3. 选中则高亮
    if (found) {
      state.selectedDefectId = found.id; // 假设有 id 字段，否则可用索引
      console.log('>>> found', found)
      playerData.defectData = found
      playerData.openDefectDelete = true
    } else {
      state.selectedDefectId = undefined;
    }
    renderResource()
  }

  // 画布复位
  function refreshFn() {
    state.scale = 1
    state.offset.x = 0
    state.offset.y = 0
    renderResource()
  }

  // 清除当前选中/绘制框
  function resetFn() {
    const copyCanvas: HTMLCanvasElement = canvas.value
    state.ctx = copyCanvas.getContext('2d')
    state.selectedDefectId = undefined
    renderResource()
  }

  // 绘制鼠标框选区
  function renderCurrentRect() {
    if (state.ctx) {
      renderResource()
      state.ctx.lineWidth = 1
      state.ctx.strokeStyle = 'red'
      state.ctx.strokeRect(
        state.beginPos.x,
        state.beginPos.y,
        state.movePos.x - state.beginPos.x,
        state.movePos.y - state.beginPos.y
      )
    }
  }

  // 工具函数：将点(p)以(cx,cy)为中心旋转rad弧度
  function rotatePoint(x: number, y: number, cx: number, cy: number, rad: number) {
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: cy + dx * Math.sin(rad) + dy * Math.cos(rad)
    }
  }

  // 获取画布坐标对应的图片坐标
  function getImageCoordsFromCanvas(canvasX: number, canvasY: number) {
    // 画布中心
    const canvasWidth = canvas.value.width;
    const canvasHeight = canvas.value.height;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const rotate = (playerData.rotate || 0) % 360;
    const rad = rotate * Math.PI / 180;
    const { WIDTH, HEIGHT } = getSize();
    const drawW = WIDTH * state.times * state.scale;
    const drawH = HEIGHT * state.times * state.scale;

    // 1. 转到以画布中心为原点
    let x = canvasX - cx;
    let y = canvasY - cy;

    // 2. 逆旋转
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;

    // 3. 转到图片绘制区域左上角为原点，再减去offset
    let imgX = rx + drawW / 2 - state.offset.x;
    let imgY = ry + drawH / 2 - state.offset.y;

    // 4. 缩放/倍数逆变换，得到图片坐标
    let px = imgX / (state.times * state.scale);
    let py = imgY / (state.times * state.scale);

    return { x: px, y: py };
  }

  // 计算选区位置
  function computePos() {
    if (Math.abs(state.movePos.x - state.beginPos.x) < 2 || Math.abs(state.movePos.y - state.beginPos.y) < 2) return false

    // 左上右下，转为图片坐标
    const p1 = getImageCoordsFromCanvas(state.beginPos.x, state.beginPos.y);
    const p2 = getImageCoordsFromCanvas(state.movePos.x, state.movePos.y);
    console.log('>>> ', state.beginPos, state.movePos)
    // console.log('>>> ', p1, p2)

    // 可能从右下画到左上，要保证 x/y/w/h为正
    let x = Math.min(p1.x, p2.x);
    let y = Math.min(p1.y, p2.y);
    let w = Math.abs(p2.x - p1.x);
    let h = Math.abs(p2.y - p1.y);

    let original = {
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h)
    };
    posToDefectPos(original)
  }

  // 将选区位置转换为缺陷位置
  function posToDefectPos(pos: { x: number, y: number, w: number, h: number }) {
    if (pos.h <= 0) {
      pos.y = pos.y + pos.h
      pos.h = Math.abs(pos.h)
    }
    if (pos.w <= 0) {
      pos.x = pos.x + pos.w
      pos.w = Math.abs(pos.w)
    }
    const { WIDTH, HEIGHT } = getSize();
    // console.log('>>> ', WIDTH, HEIGHT, pos)
    if (pos.x < 0 || pos.y < 0 || pos.x + pos.w > WIDTH || pos.y + pos.h > HEIGHT) {
      console.error('不能超出视图区域!')
      resetFn()
    } else {
      console.log('>>> pos', pos)
      playerData.defectData = {
        xmax: pos.x + pos.w,
        xmin: pos.x,
        ymax: pos.y + pos.h,
        ymin: pos.y,
      }
      console.log('>>> defectData', playerData.defectData)
      playerData.openDefectConfirm = true;
    }
  }

  // 播放视频或图片
  function play() {
    pause()
    if (isVideoElement()) {
      video.play()
      function animation() {
        if (!playerData.isPlaying) {
          return;
        }
        state.animationFrame = requestAnimationFrame(animation)
        renderResource()
      }
      animation()
    }
  }

  // 暂停视频播放
  function pause() {
    cancelAnimationFrame(state.animationFrame)
    if (isVideoElement()) {
      video.pause()
    }
  }

  // 跳转到指定时间
  function seekTo(time: number) {
    if (isVideoElement()) {
      if (time < 0 || time > video.duration) {
        console.warn('>>> 跳转时间超出视频范围！', time);
        time = Math.max(0, Math.min(time, video.duration)); // 限制在视频范围内
      }
      video.currentTime = time;
    }
  }

  // 获取视频或图片的原始尺寸
  function getSize() {
    const WIDTH = isVideoElement() ? video.videoWidth : img.width
    const HEIGHT = isVideoElement() ? video.videoHeight : img.height
    return { WIDTH, HEIGHT }
  }

  // 获取当前帧数
  function getCurrentFrame() {
    if (!isVideoElement()) {
      return 0; // 如果是图片，返回0帧
    }
    const frameRate = playerData.fps || 24; // 默认帧率为24fps
    return parseFloat((video.currentTime * frameRate).toFixed());
  }

  // 获取不带扩展名的文件名
  function getFilenameWithoutExtension(url: string) {
    // 1. 获取 URL 中的最后一部分（文件名）
    const pathname = new URL(url, window.location.origin).pathname;
    const filename = pathname.split('/').pop() || ''; // 获取最后一段

    // 2. 去掉扩展名（.mp4, .webm 等）
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    return nameWithoutExt.substring(0, 50); // 限制文件名长度为50个字符
  }

  // 获取当前帧或者图片
  function getDataURL(hasDefect = false) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      console.error('>>> 无法获取临时画布上下文');
      return false;
    }
    const { WIDTH, HEIGHT } = getSize();

    // 设置临时Canvas的尺寸为视频的原始尺寸
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;

    tempCtx.drawImage(isVideoElement() ? video : img, 0, 0, tempCanvas.width, tempCanvas.height);

    const defectPosList = getDefectPosList();
    if (hasDefect && defectPosList.length) {
      const textPositions: { x: number, y: number, text: string }[] = [];
      const scale = Math.max(1, Math.min(4, WIDTH / 1000));
      defectPosList.forEach((it: any) => {

        const x1 = it.xmin;
        const y1 = it.ymin;
        const x2 = it.xmax;
        const y2 = it.ymax;

        textPositions.push({
          x: x1,
          y: y1,
          text: it.defectType || ''
        });

        tempCtx.lineWidth = scale * 1 // 根据画布宽度动态调整线宽;
        tempCtx.strokeStyle = 'red';
        tempCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      });

      tempCtx.restore();

      // 在全局坐标系下画文字
      tempCtx.save();
      tempCtx.font = 'bold ' + scale * 14 + 'px "黑体" ';
      tempCtx.fillStyle = 'blue';
      const offset = scale * 3;
      textPositions.forEach(tp => {
        tempCtx.fillText(tp.text, tp.x, tp.y - offset);
      });
      tempCtx.restore();
    } else {
      tempCtx.restore(); // 恢复画布状态
    }

    // 将Canvas内容转换为Data URL
    const dataURL = tempCanvas.toDataURL('image/png');

    return dataURL;
  }

  // 下载当前帧或者图片
  function downloadCurrentFrame() {
    const dataURL = getDataURL(true);
    if (!dataURL) {
      return;
    }

    // 创建一个隐藏的<a>元素用于触发下载
    const link = document.createElement('a');
    link.href = dataURL;
    const time = isVideoElement() ? ('_' + video.currentTime) : ''; // 获取当前时间（视频的当前时间）
    const src = isVideoElement() ? video.src : img.src;
    link.download = getFilenameWithoutExtension(src) + time + '.png'; // 下载文件名

    // 触发点击事件，开始下载
    document.body.appendChild(link); // 需要添加到DOM中才能触发点击事件
    link.click();

    // 清理
    document.body.removeChild(link);
  }

  // 初始化鼠标状态
  function initMouseState() {
    state.mouseState.mousedown = false
    state.mouseState.mousemove = false
    state.mouseState.mouseup = false
  }

  // 鼠标在document松开事件
  function mouseupFnDocument() {
    if (!state.mouseState.mousedown) {
      return
    }
    document.onselectstart = null
    initMouseState()
  }

  // 监听键盘事件
  function listenerKeyEvent(event: KeyboardEvent) {
    // console.log('>>> key event', event)
    if (playerData.openSpeed || playerData.openTool || playerData.openDefectConfirm || playerData.openHelp || playerData.openFile) {
      return;
    }
    if (playerData.isReviewImg && !isVideoElement()) {
      switch (event.key) {
        case 'r': // 图片复原
          refreshFn()
          break;
        default:
          break;
      }
      return;
    }
    switch (event.key) {
      case 'q': // 快退
        playerData.quickPlayPrev++;
        break;
      case 'e': // 快进
        playerData.quickPlayNext++;
        break;
      case ' ': // 空格键
        playerData.isPlaying = !playerData.isPlaying
        playerData.isAdd = false;
        break;
      case 'a': // 新增缺陷
        playerData.isPlaying = false
        playerData.isAdd = !playerData.isAdd
        break;
      case 'v': // 显示/隐藏缺陷
        playerData.showDefect = !playerData.showDefect;
        break;
      case 'r': // 图片复原
        refreshFn()
        break;
      default:
        break;
    }
  }

  // 监听文件路径变化
  watch(() => playerData.nginxPath, (newVal) => {
    // console.log('>>> 图片地址:', newVal)
    initResourceFn()
  }, { immediate: true })

  // 监听缺陷数据变化
  watch(() => [playerData.defectPosList], (newVal) => {
    // console.log('>>> 缺陷数据:', newVal)
    renderResource()
  })

  // 监听播放器状态变化
  watch(() => playerData.isPlaying, (newVal) => {
    // console.log('>>> 是否正在播放:', newVal)
    if (isVideoElement()) {
      if (newVal && video.paused) {
        play()
      } else if (!newVal && !video.paused) {
        pause()
        // console.log('>>> currentTime:', video.currentTime)
      }
    }
  })

  // 监听跳转秒数变化
  watch(() => playerData.seekTo, (newVal) => {
    // console.log('>>> 跳转到秒数:', newVal)
    if (isVideoElement() && newVal) {
      if (playerData.isPlaying) {
        pause()
        nextTick(() => {
          play()
        });
      }
      video.currentTime = newVal
    }
  })

  // 监听播放速度变化
  watch(() => playerData.speed, (newVal) => {
    // console.log('>>> 播放速度变化:', newVal)
    if (isVideoElement()) {
      video.playbackRate = newVal
    }
  })

  // 监听快速播放变化 快进
  watch(() => playerData.quickPlayNext, (newVal) => {
    // console.log('>>> 快进:', newVal)
    if (isVideoElement() && newVal) {
      playerData.isPlaying = false;
      const s = playerData.toolData.frameStep / playerData.fps
      // console.log('>>> currentTime', video.currentTime)
      video.currentTime += s;
      // console.log('>>> currentTime', video.currentTime)
    }
  })

  // 监听快速播放变化 快退
  watch(() => playerData.quickPlayPrev, (newVal) => {
    // console.log('>>> 快退:', newVal)
    if (isVideoElement() && newVal) {
      playerData.isPlaying = false;
      const s = playerData.toolData.frameStep / playerData.fps
      // console.log('>>> currentTime', video.currentTime)
      video.currentTime -= s;
      // console.log('>>> currentTime', video.currentTime)
    }
  })

  // 监听下载变化
  watch(() => playerData.download, (newVal) => {
    // console.log('>>> 下载:', newVal)
    if (newVal) {
      downloadCurrentFrame();
    }
  })

  // 监听画布大小变化
  watch(() => playerData.resize, () => {
    // console.log('>>> 画布大小变化:')
    resizeResourceFn();
  })

  // 监听画布大小变化
  watch(() => playerData.openDefectConfirm, (newVal) => {
    // console.log('>>> 新增缺陷结束:')
    if (!newVal) {
      resetFn();
    }
  })

  // 监听删除弹窗关闭
  watch(() => playerData.openDefectDelete, (newVal) => {
    // console.log('>>> 删除弹窗关闭:')
    if (!newVal) {
      state.selectedDefectId = undefined;
      renderResource();
    }
  })

  // 监听显示/隐藏缺陷
  watch(() => playerData.showDefect, () => {
    // console.log('>>> 显示/隐藏缺陷:', newVal)
    if (!playerData.isPlaying) {
      renderResource()
    }
  })

  onMounted(() => {
    nextTick(() => initResourceFn())
    window.addEventListener('resize', resizeResourceFn)
    window.addEventListener('mouseup', mouseupFnDocument)
    window.addEventListener('keydown', listenerKeyEvent);
  })
  onUnmounted(() => {
    window.removeEventListener('resize', resizeResourceFn)
    window.removeEventListener('mouseup', mouseupFnDocument)
    window.removeEventListener('keydown', listenerKeyEvent);
    cancelAnimationFrame(state.animationFrame)
    if (isVideoElement()) {
      video.pause()
    }
  })

  return {
    canvas,
    mousedownFn,
    mousemoveFn,
    mouseupFn,
    mouseoutFn,
    wheelFn,
    dblclickFn,
    play,
    pause,
    seekTo,
    getDataURL,
    resetFn,
    refreshFn,
    getDefectPosList,
    getCurrentFrame,
    state,
    playerData,
  }
}