<template>
  <div
    class="music-player"
    :class="{ expanded: isExpanded || isLocked }"
    @mouseenter="expand"
    @mouseleave="collapse"
  >
    <!-- 播放条主体 -->
    <div class="player-content">
      <audio ref="audioPlayer" @ended="handleAudioEnd"></audio>
      <div class="song-info">
        <span class="song-title">{{ currentSong?.title || '歌曲标题' }}</span> - <span class="song-artist">{{ currentSong?.artist || '歌手' }}</span>
      </div>
      <div class="controls">
        <button class="play-btn" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
        <button class="prev-btn">⏮</button>
        <button class="next-btn">⏭</button>
        <button class="lock-btn" @click.stop="toggleLock">
          {{ isLocked ? "🔒" : "🔓" }}
        </button>
      </div>
      <div class="progress-container">
        <span class="time current">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="handleProgressClick" ref="progressBar">
          <div class="progress" :style="{ width: `${progressPercent}%` }"></div>
        </div>
        <span class="time duration">{{ formatTime(duration) }}</span>
      </div>
    </div>
    <!-- 露出小条部分 -->
    <div class="mini-bar" v-if="!isExpanded && !isLocked">
      <span>🎵</span>
    </div>
  </div>
</template>

<script setup>
import { ref ,watch ,onMounted ,onUnmounted} from 'vue'

// 接收父组件传递过来的当前播放歌曲
const props = defineProps({
  currentSong: {
    type: Object,
    required: false,
    default: null
  }
})

const audioPlayer = ref(null)
const isPlaying = ref(false)

const currentTime = ref(0)
const duration = ref(0)
const progressPercent = ref(0)

const isExpanded = ref(false)
const isLocked = ref(false)

const progressBar = ref(null)

const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  if (!isLocked.value) isExpanded.value = false
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
  if (isLocked.value) isExpanded.value = true
}

// 监听歌曲变化
watch(
  () => props.currentSong,
  (newSong) => {
    if (newSong && newSong.url) {
      // 加载新歌曲
      audioPlayer.value.src = "http://localhost:11451" + newSong.url
      audioPlayer.value.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('播放失败:', err)
      })
    }
  },
  { immediate: true }
)

// 播放/暂停切换
const togglePlay = () => {
  if (!audioPlayer.value) return

  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 监听音频播放进度
const handleTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
    duration.value = audioPlayer.value.duration || 0
    progressPercent.value = (currentTime.value / duration.value) * 100
  }
}

// 初始化时添加事件监听
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('timeupdate', handleTimeUpdate)
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('timeupdate', handleTimeUpdate)
  }
})

// 处理进度条点击
const handleProgressClick = (e) => {
  if (!audioPlayer.value || !progressBar.value || !duration.value) return

  const rect = progressBar.value.getBoundingClientRect()
  const clickPosition = e.clientX - rect.left
  const percent = clickPosition / rect.width
  const newTime = percent * duration.value

  audioPlayer.value.currentTime = newTime
  progressPercent.value = percent * 100
}

// 格式化时间为分:秒格式
const formatTime = (time) => {
  if (isNaN(time)) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  max-width: 90%;
  transition: all 0.3s ease;
  font-family: "Microsoft YaHei", sans-serif;
  z-index: 999;
  cursor: pointer;
}

/* 初始只露出小条 */
.music-player .mini-bar {
  background: #1f1f1f;
  color: #fff;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
}

/* 展开后的播放条 */
.music-player .player-content {
  background: #282828;
  color: #fff;
  border-radius: 8px 8px 0 0;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 初始状态隐藏内容，只显示mini-bar */
.music-player:not(.expanded) .player-content {
  display: none;
}

/* 歌曲信息 */
.song-info {
  font-size: 14px;
  font-weight: 500;
}

/* 控制按钮 */
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.controls button {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

/* 锁定按钮特殊样式 */
.lock-btn {
  margin-left: auto;
  font-size: 16px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%; /* 添加容器宽度 */
}

.time {
  font-size: 12px;
  color: #aaa;
  white-space: nowrap; /* 防止时间文本换行 */
}

/* 进度条 */
.progress-bar {
  height: 5px;
  background: #444;
  border-radius: 3px;
  overflow: hidden;
  flex-grow: 1; /* 让进度条占满剩余空间 */
}

.progress-bar .progress {
  height: 100%;
  background: #1db954;
  transition: width 0.3s;
}

/* 鼠标悬浮/锁定效果 */
.music-player.expanded {
  bottom: 0;
}
</style>
