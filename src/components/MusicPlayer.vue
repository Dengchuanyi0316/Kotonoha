<template>
  <div
    class="music-player"
    :class="{ expanded: isExpanded || isLocked }"
    @mouseenter="expand"
    @mouseleave="collapse"
  >
    <!-- 播放条主体 -->
    <div class="player-content">
      <div class="song-info">
        <span class="song-title">歌曲标题</span> - <span class="song-artist">歌手</span>
      </div>
      <div class="controls">
        <button class="play-btn">▶</button>
        <button class="prev-btn">⏮</button>
        <button class="next-btn">⏭</button>
        <button class="lock-btn" @click.stop="toggleLock">
          {{ isLocked ? "🔒" : "🔓" }}
        </button>
      </div>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
    </div>
    <!-- 露出小条部分 -->
    <div class="mini-bar" v-if="!isExpanded && !isLocked">
      <span>🎵</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isExpanded = ref(false)
const isLocked = ref(false)

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

/* 进度条 */
.progress-bar {
  height: 5px;
  background: #444;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar .progress {
  height: 100%;
  width: 30%; /* 临时展示比例 */
  background: #1db954;
  transition: width 0.3s;
}

/* 鼠标悬浮/锁定效果 */
.music-player.expanded {
  bottom: 0;
}
</style>
