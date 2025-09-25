import { ref, onMounted, onUnmounted } from 'vue'
import { defineStore } from 'pinia'

export const useMusicPlayerStore = defineStore('musicPlayer', () => {
  // 状态
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const progressPercent = ref(0)

  // audio元素引用
  let audioElement = null

  // 初始化audio元素
  onMounted(() => {
    // 创建全局audio元素
    audioElement = new Audio()
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('ended', handleAudioEnd)
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
  })

  // 清理事件监听
  onUnmounted(() => {
    if (audioElement) {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('ended', handleAudioEnd)
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.pause()
    }
  })

  // 监听歌曲变化
  const loadSong = (song) => {
    if (!song || !song.url) return

    currentSong.value = song
    audioElement.src = "http://localhost:11451" + song.url
    audioElement.currentTime = 0

    // 自动播放新歌曲
    audioElement.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
    })
  }

  // 播放/暂停切换
  const togglePlay = () => {
    if (!audioElement || !currentSong.value) return

    if (isPlaying.value) {
      audioElement.pause()
    } else {
      audioElement.play()
    }
    isPlaying.value = !isPlaying.value
  }

  // 处理进度条点击
  const seekTo = (percent) => {
    if (!audioElement || !duration.value) return

    const newTime = percent * duration.value
    audioElement.currentTime = newTime
    progressPercent.value = percent * 100
  }

  // 监听音频播放进度
  const handleTimeUpdate = () => {
    if (!audioElement) return

    currentTime.value = audioElement.currentTime
    duration.value = audioElement.duration || 0
    progressPercent.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  }

  // 处理音频元数据加载完成
  const handleLoadedMetadata = () => {
    if (!audioElement) return
    duration.value = audioElement.duration || 0
  }

  // 处理音频播放结束
  const handleAudioEnd = () => {
    isPlaying.value = false
    // 这里可以添加自动播放下一首的逻辑
  }

  // 格式化时间为分:秒格式
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    loadSong,
    togglePlay,
    seekTo,
    formatTime
  }
})
