<template>
  <div class="note-editor-container">
    <!-- 左侧大纲栏 -->
    <div class="outline-panel" v-show="showOutline">
      <div class="outline-header">
        <h3>笔记列表</h3>
        <el-button type="primary" size="small" @click="initializeNewNote">新建</el-button>
      </div>
      <ul class="note-list">
        <li
          v-for="(note, index) in notes"
          :key="note.id || index"
          @click="selectNote(index)"
          :class="{ active: currentIndex === index }"
          @contextmenu.prevent="handleDeleteNote (index)"
        >
          <template v-if="editIndex === index">
            <el-input
              v-model="notes[index].title"
              size="small"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              :ref="(el) => titleInput[index] = el"
              autofocus
            />
          </template>
          <template v-else>
            <span @dblclick="startEditTitle(index)">
              {{ note.title || `未命名 ${index + 1}` }}
            </span>
          </template>
        </li>
      </ul>
    </div>

    <!-- 右侧编辑区域 -->
    <div class="editor-panel" :class="{ full: !showOutline }">
      <div class="toolbar-wrapper">
        <div class="editor-toolbar">
          <el-button
              circle
              size="large"
              @click="toggleOutline"
            >
              <HiddenIcon size="24" />
            </el-button>
        </div>

        <div class="editor-controls">
          <div class="tiptap-toolbar">

            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('bold') }"
              @click="editor && editor.chain().focus().toggleBold().run()"
            >
              <BoldIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('italic') }"
              @click="editor && editor.chain().focus().toggleItalic().run()"
            >
              <ItalicIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('underline') }"
              @click="editor && editor.chain().focus().toggleUnderline().run()"
            >
              <UnderlineIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('strike') }"
              @click="editor && editor.chain().focus().toggleStrike().run()"
            >
              <StrikeIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('bulletList') }"
              @click="editor && editor.chain().focus().toggleBulletList().run()"
            >
              <BulletListIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('orderedList') }"
              @click="editor && editor.chain().focus().toggleOrderedList().run()"
            >
              <OrderedListIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('textAlign', { align: 'left' }) }"
              @click="editor && editor.chain().focus().setTextAlign('left').run()"
            >
              <TextAlignLeftIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('textAlign', { align: 'center' }) }"
              @click="editor && editor.chain().focus().setTextAlign('center').run()"
            >
              <TextAlignCenterIcon />
            </el-button>
            <el-button
              class="toolbar-btn"
              size="default"
              :class="{ active: editor?.isActive('textAlign', { align: 'right' }) }"
              @click="editor && editor.chain().focus().setTextAlign('right').run()"
            >
              <TextAlignRightIcon />
            </el-button>


        </div>
          <el-button
            circle
            type="primary"
            size="large"
            @click="saveNote"
            style="margin-left: auto;"
          >
            <SaveIcon size="24" />
          </el-button>
        </div>
      </div>

      <div class="editor-content">
        <div class="editor-scroll" @click="focusEditor">
          <editor-content
            :editor="editor"
            class="editor-inner"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TextAlign from '@tiptap/extension-text-align'

import BoldIcon from '@/components/icons/BoldIcon.vue'
import ItalicIcon from '@/components/icons/ItalicIcon.vue'
import UnderlineIcon from '@/components/icons/UnderlineIcon.vue'
import StrikeIcon from '@/components/icons/StrikeIcon.vue'
import BulletListIcon from '@/components/icons/BulletListIcon.vue'
import OrderedListIcon from '@/components/icons/OrderedListIcon.vue'
import TextAlignLeftIcon from '@/components/icons/TextAlignLeftIcon.vue'
import TextAlignCenterIcon from '@/components/icons/TextAlignCenterIcon.vue'
import TextAlignRightIcon from '@/components/icons/TextAlignRightIcon.vue'
import SaveIcon from '@/components/icons/SaveIcon.vue'
import HiddenIcon from '@/components/icons/HiddenIcon.vue'



import { fetchNotes, createNote, updateNote, deleteNote } from '@/api/note'

const notes = ref([])
const currentIndex = ref(-1)
const editIndex = ref(null)
const showOutline = ref(true)

const titleInput = ref([])
const editor = ref(null)
const currentContent = ref('')

const createEditor = (content = '') => {
  if (editor.value) editor.value.destroy()

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
    //autofocus: true,
    onUpdate: ({ editor }) => {
      currentContent.value = editor.getHTML()
    }
  })
}

const loadNotes = async () => {
  try {
    const res = await fetchNotes()
    notes.value = res.data || []
    currentIndex.value = -1
  } catch (err) {
    console.error('获取笔记失败', err)
  }
}

const initializeNewNote = () => {
  const noteCount = notes.value.length + 1
  const defaultTitle = `未命名 ${noteCount}`

  notes.value.push({
    id: null,
    title: defaultTitle,
    contentJson: '',
    description: '',
  })

  currentIndex.value = notes.value.length - 1
  selectNote(currentIndex.value)
}

const handleDeleteNote  = async (index) => {
  const note = notes.value[index]
  // 使用原生confirm对话框
  if (!confirm(`确定删除【${note.title}】吗？`)) {
    return // 用户取消删除
  }

  try {
    if (note.id) {
      await deleteNote(note.id)
    }
    notes.value.splice(index, 1)

    if (currentIndex.value === index) {
      currentIndex.value = -1
      createEditor('')
    }
  } catch (e) {
    console.error('删除失败', e)
  }
}

const selectNote = (index) => {
  currentIndex.value = index
  const note = notes.value[index] || { contentJson: '' }
  nextTick(() => {
    createEditor(note.contentJson || '')
  })
}

onMounted(() => {
  loadNotes().then(() => {
    nextTick(() => {
      // const initialContent = notes.value[currentIndex.value]?.content || ''
      // createEditor(initialContent)
    })
  })
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

const startEditTitle = (index) => {
  editIndex.value = index
  nextTick(() => {
    if (titleInput.value[index]) titleInput.value[index].focus()
  })
}

const finishEditTitle = async () => {
  if (editIndex.value === null) return
  editIndex.value = null
}

const toggleOutline = () => {
  showOutline.value = !showOutline.value
}

const saveNote = async () => {
  const note = notes.value[currentIndex.value]
  note.contentJson = currentContent.value
  console.log("=======提交参数=========",note)
  const submitData = {
    title: note.title,
    description: note.description,
    contentJson: note.contentJson,
    // 根据需要添加status、tags、coverImage等字段
  }
  try {
    if (note.id) {
      await updateNote(note.id, submitData)
    } else {
      const res = await createNote(submitData)
      note.id = res.data.id
    }
    alert('保存成功')
  } catch (e) {
    console.error('保存失败', e)
    alert('保存失败，请查看控制台')
  }
}
const focusEditor = () => {
  if (editor.value) {
    editor.value.commands.focus()
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

.editor-controls button {
  float: right;
}

.editor-content {
  flex: 1;
  margin-top: 10px;
  height: calc(100% - 100px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-scroll {
  flex: 1;
  overflow-y: auto;
  border: none;
  border-radius: 8px;
  padding: 1px;
  background: transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}

.editor-scroll:focus-within {
  box-shadow: 0 0 0 2px #409eff33;
  border-color: #409eff;
}

.editor-inner {
  border: 1px solid #ccc;
  border-radius: 6px;
  min-height: 550px;
  padding: 10px;
  background: white;
}

.tiptap-toolbar {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  padding: 5px 0;
}

.tiptap-toolbar .el-button {
  border-radius: 50%;
}

.ProseMirror {
  min-height: 100%;
  height: 100%;
  padding: 15px;
  outline: none;
  background: white;
  overflow-y: auto;
  cursor: text;
  white-space: pre-wrap;
}

.toolbar-btn {
  border-radius: 6px !important;   /* 方形带圆角 */
  border: 1px solid transparent;   /* 默认透明边框 */
  background-color: transparent !important;
  color: var(--el-text-color-primary);
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.toolbar-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

.toolbar-btn.active {
  background-color: #409eff !important;  /* Element Plus 主蓝 */
  color: white !important;
  border-color: #409eff !important;
}

.toolbar-btn:hover {
  border-color: #409eff !important;
  color: #409eff !important;
}

.el-button--circle.toolbar-btn {
  border-radius: 50% !important;
}
</style>
