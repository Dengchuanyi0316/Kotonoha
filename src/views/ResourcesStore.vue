<template>
  <div class="resource-page">
    <!-- 分类导航 -->
    <div class="category-nav">
      <el-tabs v-model="activeTab" class="category-tabs">
        <el-tab-pane label="动画" name="animation" class="category-tab"></el-tab-pane>
        <el-tab-pane label="游戏" name="game" class="category-tab"></el-tab-pane>
        <el-tab-pane label="工具" name="tool" class="category-tab"></el-tab-pane>
      </el-tabs>
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
          <el-card v-for="item in paginatedResources" :key="item.id" class="resource-card">
            <div class="resource-item">
              <img :src="item.imageUrl" alt="{{ item.name }}" class="resource-image">
              <div class="resource-info">
                <h3>{{ item.name }}</h3>
                <p class="resource-description">{{ item.description }}</p>
                <div class="resource-meta">
                  <span class="resource-type">{{ item.category }}</span>
                  <span class="resource-date">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </el-card>
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
          <el-select v-model="uploadForm.tags" multiple placeholder="请选择标签" style="width: 100%">
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源文件" prop="files">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="/api/upload/files"
            multiple
            :on-success="handleFileSuccess"
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
            action="/api/upload/thumbnail"
            :before-upload="beforeThumbnailUpload"
            :on-success="handleThumbnailSuccess"
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
import { ref, computed } from 'vue';
import { ElCard, ElTabs, ElTabPane, ElCollapse, ElCollapseItem, ElCheckboxGroup, ElCheckbox, ElSelect, ElOption, ElButton, ElPagination } from 'element-plus';
import 'element-plus/dist/index.css';
import { getTagByCategory} from '@/api/tag.js'

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

// 动画资源数据（增加更多示例数据）
const animationResources = ref([
  { id: 1, name: '2D角色行走动画', description: '高质量2D角色行走循环动画，包含8个方向', category: '2D动画', date: '2023-11-15', imageUrl: 'https://picsum.photos/id/11/300/200', downloads: 1240 },
  { id: 2, name: '3D场景过渡动画', description: '3D游戏场景切换特效动画，带alpha通道', category: '3D动画', date: '2023-11-14', imageUrl: 'https://picsum.photos/id/22/300/200', downloads: 876 },
  { id: 3, name: '像素风格爆炸动画', description: '8位像素风格爆炸特效，逐帧动画', category: '逐帧动画', date: '2023-11-13', imageUrl: 'https://picsum.photos/id/33/300/200', downloads: 2153 },
  { id: 4, name: '骨骼动画基础模板', description: '人物骨骼动画基础模板，含绑定权重', category: '骨骼动画', date: '2023-11-12', imageUrl: 'https://picsum.photos/id/44/300/200', downloads: 1567 },
  { id: 5, name: '火焰特效动画', description: '逼真的2D火焰特效循环动画', category: '2D动画', date: '2023-11-11', imageUrl: 'https://picsum.photos/id/55/300/200', downloads: 982 },
  { id: 6, name: '角色攻击动画', description: '3D角色攻击动作序列，含多种攻击方式', category: '3D动画', date: '2023-11-10', imageUrl: 'https://picsum.photos/id/66/300/200', downloads: 1845 },
  { id: 7, name: 'UI按钮反馈动画', description: '游戏UI按钮点击反馈动画集合', category: '逐帧动画', date: '2023-11-09', imageUrl: 'https://picsum.photos/id/77/300/200', downloads: 3210 },
  { id: 8, name: '动物骨骼动画', description: '四足动物骨骼动画模板，含行走奔跑循环', category: '骨骼动画', date: '2023-11-08', imageUrl: 'https://picsum.photos/id/88/300/200', downloads: 765 },
  { id: 9, name: '水波纹特效', description: '2D水波纹扩散动画效果，可循环播放', category: '2D动画', date: '2023-11-07', imageUrl: 'https://picsum.photos/id/99/300/200', downloads: 1123 },
  { id: 10, name: '3D摄像机路径动画', description: '预设的3D摄像机运动路径动画', category: '3D动画', date: '2023-11-06', imageUrl: 'https://picsum.photos/id/101/300/200', downloads: 954 },
  { id: 11, name: '粒子爆炸效果', description: '2D粒子系统爆炸动画，含多种参数', category: '逐帧动画', date: '2023-11-05', imageUrl: 'https://picsum.photos/id/102/300/200', downloads: 1789 },
  { id: 12, name: '角色表情动画', description: '人物面部表情骨骼动画集合', category: '骨骼动画', date: '2023-11-04', imageUrl: 'https://picsum.photos/id/103/300/200', downloads: 2345 },
]);

// 游戏资源数据（增加更多示例数据）
const gameResources = ref([
  { id: 101, name: 'RPG角色创建系统', description: '完整的RPG游戏角色创建系统模板', category: '角色扮演', date: '2023-11-15', imageUrl: 'https://picsum.photos/id/21/300/200', downloads: 3240 },
  { id: 102, name: '回合制战斗系统', description: '策略回合制战斗系统，含AI逻辑', category: '策略游戏', date: '2023-11-14', imageUrl: 'https://picsum.photos/id/22/300/200', downloads: 2876 },
  { id: 103, name: '开放世界地图模板', description: '大型开放世界游戏地图基础模板', category: '角色扮演', date: '2023-11-13', imageUrl: 'https://picsum.photos/id/23/300/200', downloads: 4123 },
  { id: 104, name: '塔防游戏关卡编辑器', description: '塔防类游戏关卡设计工具', category: '策略游戏', date: '2023-11-12', imageUrl: 'https://picsum.photos/id/24/300/200', downloads: 1876 },
  { id: 105, name: '动作游戏角色控制器', description: '第三人称动作游戏角色控制器', category: '动作游戏', date: '2023-11-11', imageUrl: 'https://picsum.photos/id/25/300/200', downloads: 3541 },
  { id: 106, name: '赛车游戏物理引擎', description: '赛车游戏专用物理引擎配置', category: '动作游戏', date: '2023-11-10', imageUrl: 'https://picsum.photos/id/26/300/200', downloads: 2109 },
  { id: 107, name: '模拟城市建设系统', description: '城市模拟建设游戏核心系统', category: '模拟经营', date: '2023-11-09', imageUrl: 'https://picsum.photos/id/27/300/200', downloads: 2789 },
  { id: 108, name: '农场模拟种植系统', description: '农场模拟游戏作物种植生长系统', category: '模拟经营', date: '2023-11-08', imageUrl: 'https://picsum.photos/id/28/300/200', downloads: 1956 },
  { id: 109, name: 'MMORPG任务系统', description: '大型多人在线角色扮演游戏任务系统', category: '角色扮演', date: '2023-11-07', imageUrl: 'https://picsum.photos/id/29/300/200', downloads: 4321 },
  { id: 110, name: '战棋游戏网格系统', description: '战棋类游戏网格地图和移动系统', category: '策略游戏', date: '2023-11-06', imageUrl: 'https://picsum.photos/id/30/300/200', downloads: 1765 },
  { id: 111, name: '平台跳跃游戏关卡包', description: '2D平台跳跃游戏关卡设计模板', category: '动作游戏', date: '2023-11-05', imageUrl: 'https://picsum.photos/id/31/300/200', downloads: 2345 },
  { id: 112, name: '餐厅模拟经营系统', description: '餐厅模拟经营游戏核心玩法系统', category: '模拟经营', date: '2023-11-04', imageUrl: 'https://picsum.photos/id/32/300/200', downloads: 1890 },
]);

// 工具资源数据（增加更多示例数据）
const toolResources = ref([
  { id: 201, name: 'UI设计组件库', description: '包含200+UI组件的设计资源包', category: '设计工具', date: '2023-11-15', imageUrl: 'https://picsum.photos/id/41/300/200', downloads: 5240 },
  { id: 202, name: '代码自动生成器', description: '根据模板自动生成前端代码的工具', category: '开发工具', date: '2023-11-14', imageUrl: 'https://picsum.photos/id/42/300/200', downloads: 3876 },
  { id: 203, name: '文档管理系统', description: '轻量级Markdown文档管理工具', category: '办公工具', date: '2023-11-13', imageUrl: 'https://picsum.photos/id/43/300/200', downloads: 2123 },
  { id: 204, name: '图片压缩工具', description: '批量图片压缩和格式转换工具', category: '效率工具', date: '2023-11-12', imageUrl: 'https://picsum.photos/id/44/300/200', downloads: 4876 },
  { id: 205, name: 'API测试工具', description: 'RESTful API测试和文档生成工具', category: '开发工具', date: '2023-11-11', imageUrl: 'https://picsum.photos/id/45/300/200', downloads: 3541 },
  { id: 206, name: '图标生成器', description: '自定义图标生成工具，支持多格式导出', category: '设计工具', date: '2023-11-10', imageUrl: 'https://picsum.photos/id/46/300/200', downloads: 2109 },
  { id: 207, name: '项目管理模板', description: '敏捷开发项目管理表格模板', category: '办公工具', date: '2023-11-09', imageUrl: 'https://picsum.photos/id/47/300/200', downloads: 1789 },
  { id: 208, name: '批量重命名工具', description: '文件批量重命名和整理工具', category: '效率工具', date: '2023-11-08', imageUrl: 'https://picsum.photos/id/48/300/200', downloads: 2956 },
  { id: 209, name: '色彩方案生成器', description: 'UI设计色彩方案和调色板生成工具', category: '设计工具', date: '2023-11-07', imageUrl: 'https://picsum.photos/id/49/300/200', downloads: 3321 },
  { id: 210, name: '数据库管理工具', description: '轻量级数据库可视化管理工具', category: '开发工具', date: '2023-11-06', imageUrl: 'https://picsum.photos/id/50/300/200', downloads: 2765 },
  { id: 211, name: '会议记录模板', description: '结构化会议记录和待办事项模板', category: '办公工具', date: '2023-11-05', imageUrl: 'https://picsum.photos/id/51/300/200', downloads: 1345 },
  { id: 212, name: '时间跟踪工具', description: '项目时间跟踪和报告生成工具', category: '效率工具', date: '2023-11-04', imageUrl: 'https://picsum.photos/id/52/300/200', downloads: 2890 },
]);

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


// 打开上传对话框
const openUploadDialog = () => {
  const categoryMap = {
    animation: '动画',
    game: '游戏',
    tool: '工具'
  };
  // 使用汉字分类名称
  uploadForm.value.category = categoryMap[activeTab.value];
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

// 缩略图上传前校验
const beforeThumbnailUpload = (file) => {
  // 清空已选缩略图
  thumbnailList.value = [];
  return true;
};

// 文件上传成功处理
const handleFileSuccess = (response, file, fileList) => {
  uploadForm.value.files = fileList.map(file => file.response.data);
};

// 缩略图上传成功处理
const handleThumbnailSuccess = (response) => {
  uploadForm.value.thumbnail = response.data;
};

// 提交上传表单
const submitUpload = async () => {
  try {
    // 实际项目中替换为真实API
    await fetch('/api/resources', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(uploadForm.value)
    });
    uploadDialogVisible.value = false;
    // 重置表单
    fileList.value = [];
    thumbnailList.value = [];
    uploadForm.value.tags = [];
    // 刷新资源列表
    // ... existing code to refresh resources ...
  } catch (error) {
    console.error('上传失败:', error);
  }
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
