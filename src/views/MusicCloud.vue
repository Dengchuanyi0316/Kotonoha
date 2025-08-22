<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">🎶 我的音乐</h1>
    <ul>
      <li v-for="(song, i) in songs" :key="i" class="mb-2">
        {{ song.title }} - {{ song.artist }}
      </li>
    </ul>
  </div>

  <!-- 底部播放器 -->
  <MusicPlayer />
</template>

<script setup>
import MusicPlayer from "@/components/MusicPlayer.vue";

const songs = [
  { title: "Song A", artist: "Artist 1" },
  { title: "Song B", artist: "Artist 2" }
];
</script>
