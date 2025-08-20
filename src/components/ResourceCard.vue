<template>
  <div class="resource-card">
    <!-- 主体区域 - 分为左右两块 -->
    <div class="main-content">
      <!-- 左侧缩略图 -->
      <div class="resource-thumbnail">
        <img :src="getThumbnailUrl(resource.thumbnailPath)" :alt="resource.name" class="thumbnail-img">
      </div>
      <!-- 右侧信息 -->
      <div class="resource-info">
        <h3 class="resource-name">{{ resource.name }}</h3>
        <p class="resource-description">{{ truncateDescription(resource.description) }}</p>
      </div>
    </div>
    <!-- 标签栏区域 -->
    <div class="tags-section">
      <div class="resource-tags">
        <el-tag v-for="tag in resource.tags" :key="tag.id" size="small">{{ tag.name }}</el-tag>
      </div>
    </div>
    <!-- 功能按钮区域 -->
    <div class="actions-section">
      <div class="resource-actions">
        <el-button size="small" @click="handleDownload">Download</el-button>
        <el-button size="small" type="primary" @click="handlePreview">Preview</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ElButton, ElTag, ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { getFileInfo, getDownloadZipUrl } from '@/api/resource';

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

  if (!thumbnailPath) return defaultThumbnail;

  // 如果已经是完整URL，直接返回
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {

    return thumbnailPath;
  }

  // 如果后端已经返回 /files/ 开头的映射路径，直接返回
  if (thumbnailPath && thumbnailPath.startsWith('/files/')) {

    return backendBaseUrl + thumbnailPath;
  }

  // 否则拼接 /files/
  const fullPath = backendBaseUrl + `/files/${thumbnailPath}`;

  return fullPath;
};

const truncateDescription = (description) => {
  if (!description) return 'No description available';
  return description.length > 100 ? description.slice(0, 100) + '...' : description;
};

const handleDownload = async () => {
  try {
    // 显示加载状态
    const loading = ElLoading.service({
      text: '正在获取文件信息...',
      lock: true
    });

    // 调用API获取文件信息
    const { data } = await getFileInfo(props.resource.id);
    console.log('文件信息:', data);
    const { fileCount, totalSize } = data;
    loading.close();


    // 显示确认对话框
    ElMessageBox.confirm(
      `<div>文件总数: ${fileCount} 个</div><div>总大小: ${formatFileSize(totalSize)}</div>`,
      '下载确认',
      {
        confirmButtonText: '确认下载',
        cancelButtonText: '取消',
        type: 'info',
        dangerouslyUseHTMLString: true
      }
    ).then(() => {
      // 确认下载逻辑
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhh",getDownloadZipUrl(props.resource.id))
      window.open(getDownloadZipUrl(props.resource.id), '_blank');
    }).catch(() => {
      // 用户取消操作，不显示错误
      ElMessage.info('已取消下载');
    });
  } catch (error) {
    // 只处理真正的错误情况
    ElMessage.error(`下载失败: ${error?.message || '未知错误'}`);
  }
};

const handlePreview = () => {
  // 实现预览逻辑
  ElMessage.info(`Previewing ${props.resource.name}`);
  // 实际项目中应该打开预览对话框或新页面
};

// 添加文件大小格式化函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.resource-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%; /* 继承容器宽度 */
}

.main-content {
  display: flex;
  padding: 16px;
  flex: 1;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-thumbnail {
  width: 100px; /* 固定缩略图宽度 */
  height: 100px; /* 固定缩略图高度 */
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.resource-info {
  margin-left: 16px;
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.resource-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%; /* 允许名称使用卡片全部宽度 */
}

.resource-description {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags-section {
  padding: 0 16px 12px;
  height: 40px; /* 固定标签栏高度 */
  overflow: hidden;
}

.resource-tags {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none; /* 隐藏滚动条 */
}

.resource-tags::-webkit-scrollbar {
  display: none;
}

.actions-section {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.resource-actions {
  display: flex;
  justify-content: space-between;
}
</style>
