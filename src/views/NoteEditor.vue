<template>
  <div class="note-editor-container">
    <!-- 左侧大纲栏 -->
    <div class="outline-panel" v-show="showOutline">
      <div class="outline-header">
        <h3>笔记列表</h3>
        <el-button type="primary" size="small" @click="createNote">新建</el-button>
      </div>
      <ul class="note-list">
        <li
          v-for="(note, index) in notes"
          :key="note.id || index"
          @click="selectNote(index)"
          :class="{ active: currentIndex === index }"
        >
          <template v-if="editIndex === index">
            <el-input
              v-model="notes[index].filename"
              size="small"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              ref="titleInput"
              autofocus
            />
          </template>
          <template v-else>
            <span @dblclick="startEditTitle(index)">
              {{ note.filename || `未命名 ${index + 1}` }}
            </span>
          </template>
        </li>
      </ul>
    </div>

    <!-- 右侧编辑区域 -->
    <div class="editor-panel" :class="{ full: !showOutline }">
      <div class="toolbar-wrapper">
        <div class="editor-toolbar">
          <el-button @click="toggleOutline" size="small">
            {{ showOutline ? '隐藏大纲' : '显示大纲' }}
          </el-button>
        </div>

        <div class="editor-controls">
          <!-- Tiptap工具栏 -->
          <div class="tiptap-toolbar">
            <el-button size="small" @click="editor.chain().focus().toggleBold().run()" :disabled="!editor">
              <b>B</b>
            </el-button>
            <el-button size="small" @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor">
              <i>I</i>
            </el-button>
            <el-button size="small" @click="editor.chain().focus().toggleUnderline().run()" :disabled="!editor">
              <u>U</u>
            </el-button>
            <el-button size="small" @click="editor.chain().focus().toggleStrike().run()" :disabled="!editor">
              <s>S</s>
            </el-button>
            <el-button size="small" @click="editor.chain().focus().toggleBulletList().run()" :disabled="!editor">
              • 列表
            </el-button>
            <el-button size="small" @click="editor.chain().focus().toggleOrderedList().run()" :disabled="!editor">
              1. 编号
            </el-button>
            <el-button size="small" @click="editor.chain().focus().setTextAlign('left').run()" :disabled="!editor">
              左对齐
            </el-button>
            <el-button size="small" @click="editor.chain().focus().setTextAlign('center').run()" :disabled="!editor">
              居中
            </el-button>
            <el-button size="small" @click="editor.chain().focus().setTextAlign('right').run()" :disabled="!editor">
              右对齐
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="saveNote" style="margin-left: auto;">
            保存
          </el-button>
        </div>
      </div>

      <div class="editor-content">
        <!-- ✅ 替换为Tiptap编辑器 -->
        <editor-content
          :editor="editor"
          style="border: 1px solid #ccc; border-radius: 6px; min-height: 400px; padding: 10px;"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted , onUnmounted } from 'vue'

// ✅ 导入Tiptap相关组件和新扩展
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import TextAlign from '@tiptap/extension-text-align'

import { fetchFragments, createFragment, updateFragment } from '@/api/fragment'


const notes = ref([])
const currentIndex = ref(0)
const editIndex = ref(null)
const showOutline = ref(true)

const titleInput = ref(null)

// 新增：编辑器实例和内容绑定
const editor = ref(null)
const currentContent = ref('')

// ✅ 创建Tiptap编辑器实例
const createEditor = (content = '') => {
  // 如果已有编辑器实例，先销毁
  if (editor.value) {
    editor.value.destroy()
  }

  editor.value = new Editor({
    content,
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    autofocus: true,
    onUpdate: ({ editor }) => {
      currentContent.value = editor.getHTML()
    }
  })
}


const fetchNotes = async () => {
  try {
    const res = await fetchFragments()
    notes.value = res.data || []
    currentIndex.value = 0
  } catch (err) {
    console.error('获取笔记失败', err)
  }
}

const createNote = () => {
  const noteCount = notes.value.length + 1
  const defaultTitle = `未命名笔记 ${noteCount}`

  notes.value.push({
    id: null,
    title: defaultTitle,
    content: '',
    filePath: "D:\\file-self\\txt",
    fileType: "text/plain",
    fileSize: 0,
    noteId: null,
    description: '',
    sortOrder: 0,
    type: 'text',
    filename: defaultTitle + '.txt'  // ✅ 加这一行
  })

  currentIndex.value = notes.value.length - 1
}

// 新增：编辑器实例和内容绑定



// ✅ 修改切换笔记逻辑
const selectNote = (index) => {
  currentIndex.value = index
  const note = notes.value[index] || { content: '' }
  nextTick(() => {
    createEditor(note.content || '')
  })
}

// ✅ 修改组件挂载逻辑
onMounted(() => {
  fetchNotes().then(() => {
    nextTick(() => {
      const initialContent = notes.value[currentIndex.value]?.content || ''
      createEditor(initialContent)
    })
  })
})

// 新增：组件卸载时销毁编辑器（释放内存）
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})


// 大纲栏双击编辑文件名
const startEditTitle = (index) => {
  editIndex.value = index
  nextTick(() => {
    if (titleInput.value) titleInput.value.focus()
  })
}

const finishEditTitle = async () => {
  if (editIndex.value === null) return
  const note = notes.value[editIndex.value]
  editIndex.value = null
  try {
    if (note.id) {
      await updateFragment(note.id, {
        filename: note.filename,
        description: note.description,
        sortOrder: note.sortOrder,
        type: note.type
      })
    }
  } catch (e) {
    console.error('更新文件名失败', e)
  }
}

const toggleOutline = () => {
  showOutline.value = !showOutline.value
}

const saveNote = async () => {
  const note = notes.value[currentIndex.value]
  try {
    if (note.id) {
      await updateFragment(note.id, note)
    } else {
      const res = await createFragment(note)
      note.id = res.data.id
    }
    alert('保存成功')
  } catch (e) {
    console.error('保存失败', e)
    alert('保存失败，请查看控制台')
  }
}

</script>

<style scoped>
.note-editor-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* 左侧大纲栏 */
.outline-panel {
  width: 280px;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 10px;
  box-sizing: border-box;
  user-select: none;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.note-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

.note-list li {
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 6px;
}

.note-list li.active {
  background-color: #409eff;
  color: white;
}

.note-list li span {
  user-select: text;
}

/* 右侧编辑区域 */
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  transition: width 0.3s ease;
  height: 100%;
}

.editor-panel.full {
  width: 100%;
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.editor-toolbar {
  /* 可以根据需求增加样式 */
}

.editor-controls {
  flex: 1;
  background: #f3f3f3;
  border-radius: 4px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.editor-controls p {
  margin: 0;
  line-height: 32px;
  flex-grow: 1;
}

.editor-controls button {
  float: right;
}


/* 移除原 textarea 样式，添加编辑器容器样式 */
.editor-content {
  flex: 1;
  margin-top: 10px;
  height: calc(100% - 100px);
  overflow: hidden;
}

/* ✅ 添加Tiptap工具栏样式 */
.tiptap-toolbar {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;  /* 按钮过多时自动换行 */
  padding: 5px 0;
}

.editor-controls {
  flex: 1;
  background: #f3f3f3;
  border-radius: 4px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

/* ✅ 添加Tiptap编辑器内容样式 */
.ProseMirror {
  min-height: 100%;  /* 改为100%填充容器 */
  height: 100%;
  padding: 15px;     /* 增加内边距提升体验 */
  outline: none;
  background: white;
  overflow-y: auto;
}

</style>
