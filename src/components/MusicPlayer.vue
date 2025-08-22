<template>
  <div class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex items-center px-4 py-2 shadow-lg">
    <!-- 封面 -->
    <img :src="currentSong.cover" alt="cover" class="w-12 h-12 rounded mr-3" />

    <!-- 歌曲信息 -->
    <div class="flex-1">
      <p class="font-semibold">{{ currentSong.title }}</p>
      <p class="text-sm text-gray-400">{{ currentSong.artist }}</p>
      <!-- 播放进度条 -->
      <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        v-model="currentTime"
        class="w-full"
        @input="seek"
      />
    </div>

    <!-- 控制按钮 -->
    <div class="flex items-center space-x-4 ml-4">
      <button @click="prevSong">⏮️</button>
      <button @click="togglePlay">{{ isPlaying ? "⏸️" : "▶️" }}</button>
      <button @click="nextSong">⏭️</button>
    </div>

    <!-- 隐藏的 audio 标签 -->
    <audio ref="audio" @timeupdate="updateTime" @ended="nextSong"></audio>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const playlist = reactive([
  {
    title: "Song A",
    artist: "Artist 1",
    url: "园游会.mp3",
    cover: "logo.png"
  },
  {
    title: "Song B",
    artist: "Artist 2",
    url: "园游会.mp3",
    cover: "logo.png"
  }
]);

const currentIndex = ref(0);
const currentSong = reactive(playlist[currentIndex.value]);

// 切换歌曲
function loadSong(index) {
  if (index < 0) index = playlist.length - 1;
  if (index >= playlist.length) index = 0;
  currentIndex.value = index;
  Object.assign(currentSong, playlist[index]);
  audio.value.src = currentSong.url;
  audio.value.load();
  //play();
}

function play() {
  audio.value.play();
  isPlaying.value = true;
}

function pause() {
  audio.value.pause();
  isPlaying.value = false;
}

function togglePlay() {
  isPlaying.value ? pause() : play();
}

function prevSong() {
  loadSong(currentIndex.value - 1);
}

function nextSong() {
  loadSong(currentIndex.value + 1);
}

function updateTime() {
  currentTime.value = audio.value.currentTime;
  duration.value = audio.value.duration || 0;
}

function seek() {
  audio.value.currentTime = currentTime.value;
}

onMounted(() => {
  loadSong(currentIndex.value);
});
</script>
