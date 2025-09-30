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
          <div class="el-upload__tip">
            支持多文件上传
            <br>
            <span style="color: #f56c6c;">提示：大于100MB的文件将使用分片上传</span>
          </div>
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
        <!-- 新增：区分显示普通上传和分片上传进度 -->
        <p v-if="selectedFiles.find(f => f.name === currentUploadFileName)?.isLargeFile">
          {{ currentUploadFileName }} 分片上传进度：
        </p>
        <p v-else>
          {{ currentUploadFileName }} 上传进度：
        </p>
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
import {
  createTempFileAndGetSign,
  createMultipartUploadSign,
  submitFileForm,
  signPart,
  completeMultipartUpload,
  abortMultipartUpload
} from '@/api/cos.js'

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

  // 修复：根据文件类型区分签名验证条件
  return selectedFiles.value.length > 0 &&
    selectedFiles.value.every(file => {
      // 必须有signature对象和key
      if (!file.signature || !file.signature.key) {
        return false
      }

      // 必须有cosUrl
      if (!file.cosUrl) {
        return false
      }

      // 区分文件类型检查不同字段
      if (file.isLargeFile) {
        // 大文件(分片上传)需要uploadId
        return !!file.signature.uploadId
      } else {
        // 小文件(普通上传)需要signature
        return !!file.signature.signature
      }
    })
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
      console.log(`正在处理文件: ${file.name}, 大小: ${file.size}`)

      // 判断文件大小是否超过100MB (100 * 1024 * 1024 = 104857600 bytes)
      const isLargeFile = file.size > 104857600
      let signatureResponse, signatureData

      // 新增：根据文件大小选择不同的签名API
      if (isLargeFile) {
        console.log(`文件${file.name}超过100MB，使用分片上传模式`)
        // 调用分片上传签名API
        signatureResponse = await createMultipartUploadSign({
          fileName: file.name,
          fileSize: file.size
        })
      } else {
        // 普通文件签名API
        signatureResponse = await createTempFileAndGetSign({
          fileName: file.name,
          fileSize: file.size
        })
      }

      // 验证签名响应数据
      if (!signatureResponse || signatureResponse.data.code !== 200 || !signatureResponse.data) {
        console.error('获取签名失败，响应数据不完整:', signatureResponse)
        throw new Error('获取签名失败: 响应数据不完整')
      }

      // 从嵌套的data对象中提取签名信息
      signatureData = signatureResponse.data.data
      // 修复：根据上传类型区分验证条件（分片上传不需要signature字段，需要uploadId）
      if (isLargeFile) {
        // 分片上传签名验证：需要key和uploadId
        if (!signatureData || !signatureData.key || !signatureData.uploadId) {
          console.error('获取分片签名失败，签名数据不完整:', signatureData)
          throw new Error('获取分片签名失败: 缺少key或uploadId')
        }
      } else {
        // 普通上传签名验证：需要key和signature
        if (!signatureData || !signatureData.signature || !signatureData.key) {
          console.error('获取签名失败，签名数据不完整:', signatureData)
          throw new Error('获取签名失败: 签名数据不完整')
        }
      }

      // 构建文件对象并添加到数组
      updatedFiles.push({
        ...file,
        isLargeFile,
        chunkSize: isLargeFile ? 5 * 1024 * 1024 : 0,
        totalChunks: isLargeFile ? Math.ceil(file.size / (5 * 1024 * 1024)) : 0,
        uploadedChunks: isLargeFile ? [] : null,
        signature: {
          key: signatureData.key,
          // 修复：分片上传不需要存储signature字段
          signature: !isLargeFile ? signatureData.signature : '',
          uploadId: signatureData.uploadId || '',
          token: signatureData.token || ''
        },
        // 修复：分片上传不需要signatureUrl（后续分片签名通过signPart接口获取）
        signatureUrl: !isLargeFile ? signatureData.signature : '',
        fileId: signatureData.fileId || null,
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
      // 新增：根据文件大小选择不同的上传方法
      if (uploadFile.isLargeFile) {
        await uploadLargeFileToCOS(uploadFile) //分片上传
      } else {
        await uploadFileToCOS(uploadFile) //普通上传
      }

      console.log(`文件${uploadFile.name}上传到COS成功，开始提交表单`)
      // 上传完成后，提交表单数据将临时文件转为正式文件
      await submitFileForm({
        fileName: uploadFile.name,
        description: '',
        fileIds: uploadFile.isLargeFile ? [] : [uploadFile.fileId] // 分片上传传空数组

      })

      showMessage(`${uploadFile.name} 上传成功`, 'success')
      console.log(`文件${uploadFile.name}上传流程全部完成`)
    }

    // 修改：上传完成后不清空文件列表，而是保留以便继续上传
    showMessage('所有文件上传完成，可以继续选择文件上传', 'success')
    console.log('所有文件上传完成，保留文件列表以便继续上传')

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

// 新：分片上传实现（前端负责分片+并发上传，每片调用后端获取单片签名URL）
const uploadLargeFileToCOS = async (uploadFile) => {
  console.log(`准备分片上传大文件到COS: ${uploadFile.name}`)

  // 原始 File 对象（与直传保持一致）
  const fileObj = uploadFile.raw
  if (!fileObj) throw new Error('找不到要上传的文件对象 (uploadFile.raw)')

  // 分片配置（你在 selectedFiles 中设置的 chunkSize / totalChunks 会优先使用）
  const chunkSize = uploadFile.chunkSize || 5 * 1024 * 1024 // 5MB
  const totalChunks = uploadFile.totalChunks || Math.ceil(fileObj.size / chunkSize)
  const key = uploadFile.signature?.key
  const uploadId = uploadFile.signature?.uploadId

  if (!key) throw new Error('文件存储 key 不存在，请重新获取签名')
  if (!uploadId) throw new Error('uploadId 不存在，请重新获取分片上传签名')

  // 并发数（可根据需要调整）
  const CONCURRENCY = 3
  const MAX_RETRY = 3

  let uploadedBytes = 0
  uploadProgress.value = 0

  // helper：按 partNumber 获取对应 Blob
  const getChunkBlob = (partNumber) => {
    const start = (partNumber - 1) * chunkSize
    const end = Math.min(fileObj.size, start + chunkSize)
    return fileObj.slice(start, end)
  }

  // helper：上传单片（含重试逻辑）
  const uploadPartWithRetry = async (partNumber) => {
    let attempt = 0
    let lastErr = null
    const blob = getChunkBlob(partNumber)

    while (attempt < MAX_RETRY) {
      attempt++
      try {
        // 1) 请求后端生成该分片的预签名URL
        const signResp = await signPart({
          key,
          uploadId,
          partNumber
        })
        const signData = signResp?.data?.data || signResp?.data || signResp
        // 兼容性：后端返回字段名可能为 url / signedUrl / signature / signatureUrl
        const signedUrl = signData?.url || signData?.signedUrl || signData?.signature || signData?.signatureUrl || signData?.preSignedUrl
        if (!signedUrl) throw new Error('获取分片签名 URL 失败')

        // 2) 使用 PUT 上传该分片
        const putResp = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            // Content-Type 可选，设置更有利于后端校验
            ...(fileObj.type ? { 'Content-Type': fileObj.type } : {})
          },
          body: blob
        })

        if (!putResp.ok) {
          const text = await putResp.text().catch(() => '')
          throw new Error(`分片 ${partNumber} 上传失败: HTTP ${putResp.status} ${text}`)
        }

        // 3) 从响应头获取 ETag（合并分片时需要）
        let etag = putResp.headers.get('ETag') || putResp.headers.get('x-etag') || ''
        etag = etag.replace(/"/g, '')

        // 返回分片信息及大小（用于进度）
        return { PartNumber: partNumber, ETag: etag, size: blob.size }
      } catch (err) {
        lastErr = err
        console.warn(`分片 ${partNumber} 上传第 ${attempt} 次失败:`, err)
        // 重试前可等待一会儿（指数退避）
        await new Promise(r => setTimeout(r, 300 * attempt))
      }
    }

    // 如果循环结束仍失败，则抛出最后的错误
    throw lastErr || new Error(`分片 ${partNumber} 上传失败（超过最大重试次数）`)
  }

  // 并发上传池
  const partsResult = new Array(totalChunks) // 保存每片 {PartNumber, ETag, size}
  let currentPart = 1
  let active = 0

  await new Promise((resolve, reject) => {
    const next = () => {
      // 如果所有分片已分配且没有正在进行的任务，则完成
      if (currentPart > totalChunks && active === 0) {
        resolve()
        return
      }

      // 启动新的任务直到并发限制
      while (active < CONCURRENCY && currentPart <= totalChunks) {
        const partNumber = currentPart++
        active++
        uploadPartWithRetry(partNumber)
          .then((partInfo) => {
            partsResult[partNumber - 1] = partInfo
            uploadedBytes += partInfo.size
            uploadProgress.value = Math.round((uploadedBytes / fileObj.size) * 100)
            console.log(`分片 ${partNumber}/${totalChunks} 上传成功，已上传 ${uploadedBytes}/${fileObj.size}`)
          })
          .catch(async (err) => {
            console.error('分片上传失败，准备中止上传：', err)
            // 可选：通知后端中止该 uploadId
            try {
              await abortMultipartUpload({ key, uploadId })
            } catch (e) {
              console.warn('abortMultipartUpload 失败：', e)
            }
            reject(err)
          })
          .finally(() => {
            active--
            next()
          })
      }
    }

    next()
  })

  // 所有分片上传成功，partsResult 中包含每片信息
  const partsList = partsResult.map(p => ({ PartNumber: p.PartNumber, ETag: p.ETag }))

  // 3) 完成分片上传（合并）
  const completeResp = await completeMultipartUpload({
    key,
    uploadId,
    parts: partsList
  })

  // 根据后端返回判断是否成功
  if (!completeResp || (completeResp.data && completeResp.data.code && completeResp.data.code !== 200)) {
    // 如果后端返回了非 200 逻辑码，抛错
    const msg = (completeResp && (completeResp.data?.message || completeResp.message)) || '完成分片上传失败'
    throw new Error(msg)
  }

  // 修复：从合并响应中提取fileId（分片上传的fileId通常在此阶段生成）
  // const { fileId } = completeResp.data.data
  // if (!fileId) {
  //   throw new Error('分片合并成功，但未返回fileId')
  // }

  // 更新进度到 100%
  uploadProgress.value = 100
  console.log(`大文件 ${uploadFile.name} 分片上传并合并完成`)
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
