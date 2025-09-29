<template>
  <div class="simple-cos-uploader">
    <h2>腾讯COS文件上传测试</h2>

    <!-- 简单的上传区域 -->
    <div class="upload-area">
      <el-upload
        class="upload-demo"
        ref="upload"
        :show-file-list="true"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :before-upload="beforeUpload"
        multiple
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">支持多文件上传</div>
        </template>
      </el-upload>

      <!-- 确认上传按钮 -->
      <div v-if="selectedFiles.length > 0" class="upload-actions" style="margin-top: 15px;">
        <el-button
          type="primary"
          :loading="uploading"
          @click="confirmUpload"
          :disabled="uploading || !hasAllSignatures"
        >
          {{ uploading ? '上传中...' : '确认上传' }}
        </el-button>
        <el-button @click="clearAllFiles" :disabled="uploading">
          取消选择
        </el-button>
      </div>

      <!-- 上传进度显示 -->
      <div v-if="uploading" class="upload-progress-section">
        <p>{{ currentUploadFileName }} 上传进度：</p>
        <el-progress :percentage="uploadProgress" :status="uploadStatus"></el-progress>
      </div>
    </div>

    <!-- 上传状态消息 -->
    <div v-if="message" class="status-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed ,nextTick} from 'vue'
import { createTempFileAndGetSign, submitFileForm } from '@/api/cos.js'

// 组件引用
const upload = ref(null)

// 上传状态
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('success') // success, exception
const currentUploadFileName = ref('')
const message = ref('')
const messageType = ref('')

// 已选择的文件列表
const selectedFiles = ref([])

// 计算属性：检查是否所有文件都已获取签名
const hasAllSignatures = computed(() => {
  console.log('检查签名状态 - selectedFiles长度:', selectedFiles.value.length)
  console.log('selectedFiles内容:', selectedFiles.value)

  // 确保selectedFiles有内容，并且每个文件都有有效的signature对象和必要的字段
  return selectedFiles.value.length > 0 &&
    selectedFiles.value.every(file =>
      file.signature &&
      file.signature.key &&
      file.signature.signature &&
      file.cosUrl
    )
})

// 处理文件选择变化
const handleFileChange = async (file, files) => {
  console.log('文件选择变化，新文件列表:', files)

  if (!files || files.length === 0) {
    return
  }

  // 过滤掉已经在selectedFiles中的文件
  const newFiles = Array.from(files).filter(file =>
    !selectedFiles.value.some(selected => selected.uid === file.uid)
  )

  if (newFiles.length === 0) {
    console.log('没有新文件需要处理')
    showMessage('请选择新的文件上传', 'info') // 添加用户可见的提示
    return
  }

  try {
    // 使用新数组确保响应式更新
    const updatedFiles = [...selectedFiles.value]

    // 循环处理每个新文件
    for (const file of newFiles) {
      console.log(`正在处理文件: ${file.name}`)

      // 调用后端API获取上传签名
      const signatureResponse = await createTempFileAndGetSign({
        fileName: file.name,
        fileSize: file.size
      })

      // 验证签名响应数据
      if (!signatureResponse || signatureResponse.data.code !== 200 || !signatureResponse.data) {
        console.error('获取签名失败，响应数据不完整:', signatureResponse)
        throw new Error('获取签名失败: 响应数据不完整')
      }

      // 从嵌套的data对象中提取签名信息
      const signatureData = signatureResponse.data.data
      if (!signatureData || !signatureData.signature || !signatureData.key) {
        console.error('获取签名失败，签名数据不完整:', signatureData)
        throw new Error('获取签名失败: 签名数据不完整')
      }

      // 构建文件对象并添加到数组 - 重点修改：将签名数据存储为signature对象
      updatedFiles.push({
        ...file,
        signature: {
          key: signatureData.key,
          signature: signatureData.signature,
          token: signatureData.token || ''
        },
        signatureUrl: signatureData.signature, // 完整的签名URL（用于PUT请求）
        fileId: signatureData.fileId || null, // 处理fileId可能缺失的情况
        cosUrl: signatureData.cosUrl || ''
      })

      showMessage(`获取${file.name}的上传凭证成功`, 'success')
      console.log(`文件${file.name}签名获取成功，准备上传`)
    }

    // 等待下一个渲染周期再更新，确保响应式系统能正确捕获变化
    await nextTick()
    selectedFiles.value = updatedFiles

  } catch (error) {
    console.error('处理文件时出错:', error)
    showMessage(`获取签名失败: ${error.message}`, 'error')
  }
}

// 处理文件移除
const handleFileRemove = (file) => {
  console.log('移除文件:', file)
  // 从selectedFiles中移除对应的文件
  const index = selectedFiles.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
    console.log('已从selectedFiles中移除文件')
  }
}

// 清空所有文件
const clearAllFiles = () => {
  console.log('清空所有已选择的文件')
  selectedFiles.value = []
  if (upload.value && upload.value.clearFiles) {
    upload.value.clearFiles()
  }
  message.value = ''
}

// 文件上传前处理
const beforeUpload = () => {
  // 可以在这里添加文件大小限制、类型限制等
  return true
}

// 确认上传（新添加的方法）
const confirmUpload = async () => {
  console.log('用户点击确认上传，开始执行上传流程')
  await startUpload()
}

// 开始上传文件
const startUpload = async () => {
  console.log('开始上传文件，当前文件列表:', selectedFiles.value)

  // 检查是否有已选择并获取了签名的文件
  if (!selectedFiles.value || selectedFiles.value.length === 0) {
    showMessage('没有待上传的文件', 'warning')
    return
  }

  // 检查是否所有文件都已获取签名
  const unsignedFiles = selectedFiles.value.filter(f => !f.signature)
  if (unsignedFiles.length > 0) {
    console.warn('发现未签名文件:', unsignedFiles)
    showMessage(`有${unsignedFiles.length}个文件尚未获取上传凭证，请等待或重新选择文件`, 'warning')
    return
  }

  uploading.value = true
  try {
    // 逐个上传文件
    for (const uploadFile of selectedFiles.value) {
      currentUploadFileName.value = uploadFile.name
      uploadProgress.value = 0
      uploadStatus.value = 'success'

      console.log(`开始上传文件: ${uploadFile.name}`)
      // 上传文件到COS
      await uploadFileToCOS(uploadFile)

      console.log(`文件${uploadFile.name}上传到COS成功，开始提交表单`)
      // 上传完成后，提交表单数据将临时文件转为正式文件
      await submitFileForm({
        fileName: uploadFile.name,
        description: '',
        fileIds: [uploadFile.fileId]
      })

      showMessage(`${uploadFile.name} 上传成功`, 'success')
      console.log(`文件${uploadFile.name}上传流程全部完成`)
    }

    // 修改：上传完成后不清空文件列表，而是保留以便继续上传
    showMessage('所有文件上传完成，可以继续选择文件上传', 'success')
    console.log('所有文件上传完成，保留文件列表以便继续上传')
    // selectedFiles.value = []
    // if (upload.value) {
    //   upload.value.clearFiles()
    // }
  } catch (error) {
    uploadStatus.value = 'exception'
    showMessage(`上传失败：${error.message}`, 'error')
    console.error('上传过程出错:', error)
  } finally {
    uploading.value = false
  }
}

// 上传文件到COS（带进度监听）
const uploadFileToCOS = (uploadFile) => {
  console.log(`准备上传文件到COS: ${uploadFile.name}`)
  // 优先使用signatureUrl，如果不存在则尝试从signature.signature获取
  const uploadUrl = uploadFile.signatureUrl || (uploadFile.signature && uploadFile.signature.signature)
  console.log('使用完整签名URL:', uploadUrl)

  if (!uploadUrl) {
    throw new Error('上传URL不存在，请重新获取签名')
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 注意：对于PUT方法的预签名URL，不需要在请求中额外添加签名参数
    // 签名已经包含在URL中了

    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        uploadProgress.value = progress
        console.log(`上传进度: ${progress}% - 已上传: ${event.loaded} / 总大小: ${event.total}`)
      }
    })

    // 监听完成事件
    xhr.addEventListener('load', () => {
      console.log(`文件上传完成，HTTP状态码: ${xhr.status}, 响应: ${xhr.responseText}`)
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        // 提取XML中的错误信息
        let errorMsg = `HTTP错误：${xhr.status}`
        try {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml')
          const messageNode = xmlDoc.querySelector('Message')
          if (messageNode) {
            errorMsg += ` - ${messageNode.textContent}`
          }
        } catch (e) {
          console.error('解析错误响应失败:', e)
        }
        reject(new Error(errorMsg))
      }
    })

    // 监听错误事件
    xhr.addEventListener('error', () => {
      console.error('网络错误导致上传失败')
      reject(new Error('网络错误'))
    })

    // 监听超时事件
    xhr.addEventListener('timeout', () => {
      console.error('上传超时')
      reject(new Error('上传超时'))
    })

    // 使用PUT方法直接发送文件数据
    xhr.open('PUT', uploadUrl)

    // 设置适当的Content-Type
    if (uploadFile.raw.type) {
      xhr.setRequestHeader('Content-Type', uploadFile.raw.type)
    }

    console.log('开始发送PUT上传请求...')
    xhr.send(uploadFile.raw)
  })
}

// 显示状态消息
const showMessage = (msg, type = 'info') => {
  console.log(`显示${type}消息: ${msg}`)
  message.value = msg
  messageType.value = type

  // 3秒后自动清除消息
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}
</script>

<style scoped>
.simple-cos-uploader {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.upload-area {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.upload-actions {
  display: flex;
  gap: 10px;
}

.upload-progress-section {
  margin-top: 20px;
}

.status-message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.status-message.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.status-message.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-message.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}
</style>
