
// 将时间字符串转换为秒数
function toSeconds(timeStr: string) {
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// 将秒数转换为时间字符串
function fromSeconds(totalSeconds: number) {
  if (isNaN(totalSeconds)) {
    return '00:00:00'; // 如果传入的秒数不是数字，返回默认时间格式
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  // 补零函数
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// 是否视频
function isVideo(fileName: string) {
  return /\.(mp4|avi|mov|mkv|flv|wmv)$/i.test(fileName);
}

export { toSeconds, fromSeconds, isVideo };