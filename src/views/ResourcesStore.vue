<template>
  <div class="resource-page">
    <!-- 分类导航 -->
    <div class="category-nav">
      <el-tabs v-model="activeTab" class="category-tabs">
        <el-tab-pane label="动画" name="animation" class="category-tab"></el-tab-pane>
        <el-tab-pane label="游戏" name="game" class="category-tab"></el-tab-pane>
        <el-tab-pane label="工具" name="tool" class="category-tab"></el-tab-pane>
      </el-tabs>

      <!-- 新增测试接口区域 -->
      <div class="test-api-container" style="display: flex; align-items: center; gap: 10px;">
        <el-input
          v-model="testCategory"
          placeholder="输入分类名称"
          style="width: 180px;"
        ></el-input>
        <el-button type="success" @click="handleTestApi">测试</el-button>
      </div>

      <el-button type="primary" icon="Upload" @click="openUploadDialog" class="upload-btn">
        上传资源
      </el-button>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧筛选区 -->
      <div class="filter-panel">
        <div class="filter-header">
          <h3 class="filter-title">资源筛选</h3>
          <div class="filter-buttons">
            <el-button type="primary" @click="applyFilter" class="apply-button">筛选</el-button>
            <el-button @click="resetFilter" class="reset-button">重置</el-button>
          </div>
        </div>

        <!-- 动画分类筛选 -->
        <el-collapse v-model="activeFilters" v-if="activeTab === 'animation'">
          <el-collapse-item title="动画类型" name="animationType">
            <el-checkbox-group v-model="selectedAnimationTypes">
              <el-checkbox label="2D动画" name="2d"></el-checkbox>
              <el-checkbox label="3D动画" name="3d"></el-checkbox>
              <el-checkbox label="逐帧动画" name="frame"></el-checkbox>
              <el-checkbox label="骨骼动画" name="bone"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
          <el-collapse-item title="文件格式" name="fileFormat">
            <el-checkbox-group v-model="selectedFileFormats">
              <el-checkbox label="MP4" name="mp4"></el-checkbox>
              <el-checkbox label="GIF" name="gif"></el-checkbox>
              <el-checkbox label="WebM" name="webm"></el-checkbox>
              <el-checkbox label="AVI" name="avi"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>

        <!-- 游戏分类筛选 -->
        <el-collapse v-model="activeFilters" v-if="activeTab === 'game'">
          <el-collapse-item title="游戏类型" name="gameType">
            <el-checkbox-group v-model="selectedGameTypes">
              <el-checkbox label="角色扮演" name="rpg"></el-checkbox>
              <el-checkbox label="策略游戏" name="strategy"></el-checkbox>
              <el-checkbox label="动作游戏" name="action"></el-checkbox>
              <el-checkbox label="模拟经营" name="simulation"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
          <el-collapse-item title="平台" name="platform">
            <el-checkbox-group v-model="selectedPlatforms">
              <el-checkbox label="PC" name="pc"></el-checkbox>
              <el-checkbox label="移动端" name="mobile"></el-checkbox>
              <el-checkbox label="主机" name="console"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>

        <!-- 工具分类筛选 -->
        <el-collapse v-model="activeFilters" v-if="activeTab === 'tool'">
          <el-collapse-item title="工具类型" name="toolType">
            <el-checkbox-group v-model="selectedToolTypes">
              <el-checkbox label="开发工具" name="dev"></el-checkbox>
              <el-checkbox label="设计工具" name="design"></el-checkbox>
              <el-checkbox label="办公工具" name="office"></el-checkbox>
              <el-checkbox label="效率工具" name="efficiency"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
          <el-collapse-item title="支持平台" name="supportPlatform">
            <el-checkbox-group v-model="selectedSupportPlatforms">
              <el-checkbox label="Windows" name="windows"></el-checkbox>
              <el-checkbox label="macOS" name="mac"></el-checkbox>
              <el-checkbox label="Linux" name="linux"></el-checkbox>
              <el-checkbox label="跨平台" name="cross"></el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 右侧资源展示区 -->
      <div class="resource-content">
        <!-- 排序工具栏 -->
        <div class="resource-toolbar">
          <el-select v-model="sortBy" placeholder="排序方式" class="sort-select">
            <el-option label="最新上传" value="date"></el-option>
            <el-option label="名称排序" value="name"></el-option>
            <el-option label="下载量" value="downloads"></el-option>
          </el-select>
        </div>

        <!-- 资源列表 -->
        <div class="resource-list">
          <!-- 加载状态 -->
          <el-skeleton v-if="loading" :count="6" class="resource-skeleton" />

          <!-- 错误提示 -->
          <div v-else-if="errorMsg" class="error-message">{{ errorMsg }}</div>

          <!-- 资源列表 -->
          <div v-else class="resource-grid">
            <!-- 动画资源 -->
            <div v-if="activeTab === 'animation'">
              <resource-card
                v-for="item in animationResources"
                :key="item.id"
                :resource="item"
              />
            </div>
            <!-- 游戏资源 -->
            <div v-if="activeTab === 'game'">
              <resource-card
                v-for="item in gameResources"
                :key="item.id"
                :resource="item"
              />
            </div>
            <!-- 工具资源 -->
            <div v-if="activeTab === 'tool'">
              <resource-card
                v-for="item in toolResources"
                :key="item.id"
                :resource="item"
              />
            </div>
            <!-- 空状态 -->
            <div v-if="totalResources === 0" class="empty-state">
              <el-empty description="暂无资源数据"></el-empty>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalResources"
            :page-sizes="[6, 12, 24]"
            layout="total, sizes, prev, pager, next, jumper"
            :prev-text="'上一页'"
            :next-text="'下一页'"
            :disabled="totalResources === 0"
          />
        </div>
      </div>
    </div>


    <!-- 上传页面 -->
    <el-dialog v-model="uploadDialogVisible" title="上传资源" width="600px">
      <el-form ref="uploadFormRef" :model="uploadForm" label-width="100px">
        <el-form-item label="资源名称" prop="name" :rules="[{ required: true, message: '请输入资源名称', trigger: 'blur' }]">
          <el-input v-model="uploadForm.name" placeholder="请输入资源名称"></el-input>
        </el-form-item>
        <el-form-item label="资源分类" prop="category">
          <el-input
            v-model="uploadForm.category"
            readonly
            class="category-input"
            style="color: #333; background-color: #fff;"
          ></el-input>
        </el-form-item>
        <el-form-item label="资源标签" prop="tags">
          <el-select
            v-model="uploadForm.tags"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
            value-key="id"
          collapse-tags
          >
          <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源文件" prop="files">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            multiple
            :auto-upload="false"
            @change="handleUploadFile"
          >
            <el-button type="primary">点击上传文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持多文件上传</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="缩略图" prop="thumbnail">
          <el-upload
            v-model:file-list="thumbnailList"
            class="upload-demo"
            :auto-upload="false"
            @change="uploadUploadThumbnail"
          >
            <el-button type="primary">点击上传缩略图</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持单文件上传</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="uploadForm.description" type="textarea" :rows="4" placeholder="请输入资源备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">确认上传</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed , watch , onMounted } from 'vue';
import {
  ElTabs,
  ElTabPane,
  ElCollapse,
  ElCollapseItem,
  ElCheckboxGroup,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElButton,
  ElPagination,
  ElMessage, ElLoading
} from 'element-plus'
import 'element-plus/dist/index.css';
import { getTagByCategory} from '@/api/tag.js'
import { uploadResourceFile , uploadThumbnail , addResource} from '@/api/resource';
import { getResourcesByCategory } from '@/api/resource';
import ResourceCard from '@/components/ResourceCard.vue';

// 组件挂载时获取资源数据
onMounted(() => {
  fetchResources();
});

// 活跃标签页
const activeTab = ref('animation');
// 展开的筛选面板
const activeFilters = ref(['animationType', 'fileFormat']);
// 排序方式
const sortBy = ref('date');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);

// 筛选选项绑定值
const selectedAnimationTypes = ref([]);
const selectedFileFormats = ref([]);
const selectedGameTypes = ref([]);
const selectedPlatforms = ref([]);
const selectedToolTypes = ref([]);
const selectedSupportPlatforms = ref([]);

// 替换静态资源数据为动态获取
const animationResources = ref([]);
const gameResources = ref([]);
const toolResources = ref([]);

// 添加加载状态和错误处理
const loading = ref(false);
const errorMsg = ref('');

// 新增上传相关变量
const uploadDialogVisible = ref(false);
const uploadForm = ref({
  name: '',
  description: '',
  category: '',
  tags: [],
  files: [],
  thumbnail: ''
});
const tags = ref([]);
const fileList = ref([]);
const thumbnailList = ref([]);

// 获取标签列表（根据当前分类）
const loadTags = async () => {
  try {
    const response = await getTagByCategory(activeTab.value);
    tags.value = response.data || [];
  } catch (error) {
    console.error('加载标签失败:', error);
    ElMessage.error('加载标签失败');
  }
};

// 监听分类切换时重新加载标签
watch(activeTab, loadTags, { immediate: true });

// 根据当前标签页获取资源总数
const totalResources = computed(() => {
  switch(activeTab.value) {
    case 'animation': return animationResources.value.length;
    case 'game': return gameResources.value.length;
    case 'tool': return toolResources.value.length;
    default: return 0;
  }
});

// 应用筛选条件
const applyFilter = () => {
  // 筛选逻辑实现
  currentPage.value = 1; // 筛选后重置到第一页
};

// 重置筛选条件
const resetFilter = () => {
  selectedAnimationTypes.value = [];
  selectedFileFormats.value = [];
  selectedGameTypes.value = [];
  selectedPlatforms.value = [];
  selectedToolTypes.value = [];
  selectedSupportPlatforms.value = [];
  currentPage.value = 1; // 重置后回到第一页
};

// 根据当前标签页和分页条件获取资源
const filteredResources = computed(() => {
  let resources = [];
  switch(activeTab.value) {
    case 'animation':
      resources = [...animationResources.value];
      break;
    case 'game':
      resources = [...gameResources.value];
      break;
    case 'tool':
      resources = [...toolResources.value];
      break;
    default:
      resources = [];
  }

  // 排序逻辑
  if (sortBy.value === 'name') {
    return resources.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'downloads') {
    return resources.sort((a, b) => b.downloads - a.downloads);
  } else {
    return resources.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
});

// 分页处理
const paginatedResources = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredResources.value.slice(startIndex, startIndex + pageSize.value);
});

// 上传文件夹时间戳
const uploadFolderTimestamp = ref('');
const filePath = ref(''); // 存储返回的文件夹路径
const thumbnailPath = ref('');

// 打开上传对话框
const openUploadDialog = () => {
  const categoryMap = {
    animation: '动画',
    game: '游戏',
    tool: '工具'
  };
  // 使用汉字分类名称
  uploadForm.value.category = categoryMap[activeTab.value];
  // 保存时间戳用于上传接口
  uploadFolderTimestamp.value = Date.now().toString();
  // 添加延迟确保响应式更新完成
  setTimeout(() => {
    uploadDialogVisible.value = true;
  }, 0);
  console.log('上传表单分类值:', uploadForm.value.category);
  // 使用汉字分类名称获取标签
  fetchTagsByCategory(categoryMap[activeTab.value]);
};

// 根据分类获取标签
const fetchTagsByCategory = async (category) => {
  try {
    // 使用封装的API函数，自动处理参数编码
    const response = await getTagByCategory(category);
    tags.value = response.data; // 根据实际API响应结构调整
  } catch (error) {
    console.error('获取标签失败:', error);
  }
};

const categoryMap = {
  animation: '动画',
  game: '游戏',
  tool: '工具'
};

// 新增：获取资源数据
const fetchResources = async () => {
  const category = categoryMap[activeTab.value];
  if (!category) return;

  loading.value = true;
  errorMsg.value = '';
  try {
    const response = await getResourcesByCategory(category);
    // 根据当前标签页更新对应资源数组
    switch(activeTab.value) {
      case 'animation':
        animationResources.value = response.data;
        break;
      case 'game':
        gameResources.value = response.data;
        break;
      case 'tool':
        toolResources.value = response.data;
        break;
    }
  } catch (error) {
    console.error('获取资源失败:', error);
    errorMsg.value = '获取资源失败，请刷新页面重试';
    ElMessage.error(errorMsg.value);
  } finally {
    loading.value = false;
  }
};

// 监听分类切换时重新加载标签和资源
watch(activeTab, () => {
  loadTags();
  fetchResources();
}, { immediate: true });

// 提交上传表单
const submitUpload = async () => {
    try {
      // 验证文件和缩略图是否已上传
      if (!filePath.value) {
        ElMessage.error('请先上传资源文件');
        return;
      }
      if (!thumbnailPath.value) {
        ElMessage.error('请先上传缩略图');
        return;
      }

      // 构造符合后端要求的资源对象
      const resourceData = {
        name: uploadForm.value.name,
        category: uploadForm.value.category,
        filePath: filePath.value,
        thumbnailPath: thumbnailPath.value,
        description: uploadForm.value.description,
        tags: uploadForm.value.tags.map(tag => ({
          id: tag.id,
          name: tag.name
          // 添加后端Tag类需要的其他属性
        }))
      };

      console.log('提交给后端的完整参数:', resourceData);


      // 调用addResource接口
      await addResource(resourceData);

      // 提交成功处理
      ElMessage.success('资源上传成功');
      uploadDialogVisible.value = false;

      // 重置表单和状态
      fileList.value = [];
      thumbnailList.value = [];
      uploadForm.value = {
        name: '',
        category: '',
        description: '',
        tags: []
      };
      filePath.value = '';
      thumbnailPath.value = '';

      // 刷新资源列表（根据实际项目实现）
      // fetchResources();

    } catch (error) {
      console.error('资源提交失败:', error);
      ElMessage.error(error.response?.data?.message || '资源提交失败，请重试');
    }
  };

const handleUploadFile = async (file) => {
  // 显示加载状态
  const loading = ElLoading.service({
    text: '文件上传中...',
    lock: true
  });

  try {
    // 调用上传接口，使用之前生成的时间戳作为folder参数
    const response = await uploadResourceFile(file.raw, uploadFolderTimestamp.value);

    // 存储返回的文件夹路径
    filePath.value = response.data.folderPath;
    console.log('上传文件路径:', filePath.value);

    // 显示成功消息
    ElMessage.success('文件上传成功');
    return true;
  } catch (error) {
    // 错误处理
    console.error('文件上传失败:', error);
    ElMessage.error(error.response?.data?.message || '文件上传失败，请重试');
    return false;
  } finally {
    // 关闭加载状态
    loading.close();
  }
};

const uploadUploadThumbnail = async (file) => {
  // 显示加载状态
  const loading = ElLoading.service({
    text: '缩略图上传中...',
    lock: true
  });

  try {
    // 调用缩略图上传接口，使用相同的时间戳参数
    const response = await uploadThumbnail(file.raw, uploadFolderTimestamp.value);

    // 存储返回的文件夹路径（与文件上传共用同一路径）
    thumbnailPath.value = response.data.folderPath;
    console.log('上传缩略图路径:', thumbnailPath.value);
    // 显示成功消息
    ElMessage.success('缩略图上传成功');
    // 将缩略图URL存储到表单中（如果需要预览）
    uploadForm.value.thumbnail = URL.createObjectURL(file.raw);
    return true;
  } catch (error) {
    // 错误处理
    console.error('缩略图上传失败:', error);
    ElMessage.error(error.response?.data?.message || '缩略图上传失败，请重试');
    return false;
  } finally {
    // 关闭加载状态
    loading.close();
  }
};

// 测试接口相关变量
const testCategory = ref('');

// 测试接口调用方法
const handleTestApi = () => {
  if (!testCategory.value.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }

  getResourcesByCategory(testCategory.value)
    .then(response => {
      console.log('接口测试结果:', response.data);
      ElMessage.success(`成功获取 ${testCategory.value} 分类资源，共 ${response.data.length} 条数据`);
    })
    .catch(error => {
      console.error('接口测试失败:', error);
      ElMessage.error('接口调用失败，请查看控制台日志');
    });
};
</script>

<style scoped>
.resource-page {
  max-width: 100%;
  min-width: 80%;
  margin: 0 auto;
  padding: 20px;
}

/* 分类导航样式 */
.category-nav {
  margin-bottom: 30px;
}

.category-tabs {
  --el-tabs-nav-background-color: transparent;
}

.category-tab {
  padding: 8px 20px;
  margin-right: 15px;
  border-radius: 20px;
  background-color: #f0f2f5;
  font-size: 16px;
}

/* 主内容区样式 */
.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 筛选面板样式 */
.filter-panel {
  width: 260px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.apply-button {
  background-color: #409eff;
  color: white;
}

.reset-button {
  background-color: #f0f2f5;
  color: #606266;
}

.el-collapse {
  border: none;
}

.el-collapse-item {
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.el-collapse-item__header {
  background-color: #f9fafb;
  padding: 12px 15px;
}

.el-checkbox {
  display: block;
  margin-bottom: 10px;
}

/* 资源内容区样式 */
.resource-content {
  flex: 1;
}

.resource-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.sort-select {
  width: 160px;
}

/* 资源列表样式 */
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.resource-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-item {
  display: flex;
  gap: 16px;
  padding: 15px;
}

.resource-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.resource-info {
  flex: 1;
}

.resource-description {
  color: #666;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

.resource-type {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 上传按钮样式 */
.category-nav {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between; /* 新增：两端对齐 */
  align-items: center; /* 新增：垂直居中对齐 */
}

.category-tabs {
  --el-tabs-nav-background-color: transparent;
}

.category-tab {
  padding: 8px 20px;
  margin-right: 15px;
  border-radius: 20px;
  background-color: #f0f2f5;
  font-size: 16px;
}

.upload-btn {
  padding: 8px 20px;
  border-radius: 20px;
}

/* 上传对话框样式 */
.el-dialog .el-form-item {
  margin-bottom: 20px;
}

.el-upload {
  margin-top: 10px;
}
</style>
