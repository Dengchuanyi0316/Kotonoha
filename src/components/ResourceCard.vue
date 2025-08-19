<template>
  <div class="resource-card">
    <div class="resource-thumbnail">
      <img :src="getThumbnailUrl(resource.thumbnailPath)" :alt="resource.name" class="thumbnail-img">
    </div>
    <div class="resource-info">
      <h3 class="resource-name">{{ resource.name }}</h3>
      <p class="resource-description">{{ truncateDescription(resource.description) }}</p>
      <div class="resource-tags">
        <el-tag v-for="tag in resource.tags" :key="tag.id" size="small">{{ tag.name }}</el-tag>
      </div>
      <div class="resource-actions">
        <el-button size="small" @click="handleDownload">Download</el-button>
        <el-button size="small" type="primary" @click="handlePreview">Preview</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElButton, ElTag, ElMessage } from 'element-plus';

const props = defineProps({
  resource: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const defaultThumbnail = '/default-thumbnail.png';

// 根据后端配置处理缩略图URL
const getThumbnailUrl = (thumbnailPath) => {
  const backendBaseUrl = 'http://localhost:11451';
  console.log('原始thumbnailPath:', thumbnailPath);
  if (!thumbnailPath) return defaultThumbnail;

  // 如果已经是完整URL，直接返回
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    console.log('完整URL路径:', thumbnailPath);
    return thumbnailPath;
  }

  // 如果后端已经返回 /files/ 开头的映射路径，直接返回
  if (thumbnailPath && thumbnailPath.startsWith('/files/')) {
    console.log('files前缀路径:', thumbnailPath);
    return backendBaseUrl + thumbnailPath;
  }

  // 否则拼接 /files/
  const fullPath = backendBaseUrl + `/files/${thumbnailPath}`;
  console.log('拼接后的完整路径:', fullPath);
  return fullPath;
};

const truncateDescription = (description) => {
  if (!description) return 'No description available';
  return description.length > 100 ? description.slice(0, 100) + '...' : description;
};

const handleDownload = () => {
  // 实现下载逻辑
  ElMessage.info(`Downloading ${props.resource.name}`);
  // 实际项目中应该调用下载API
};

const handlePreview = () => {
  // 实现预览逻辑
  ElMessage.info(`Previewing ${props.resource.name}`);
  // 实际项目中应该打开预览对话框或新页面
};
</script>

<style scoped>
.resource-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-thumbnail {
  height: 160px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.resource-info {
  padding: 12px;
}

.resource-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.resource-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.resource-tags {
  margin: 0 0 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.resource-actions {
  display: flex;
  justify-content: space-between;
}
</style>
