// src/api/cos.js
import request from '@/utils/request'

/**
 * 创建临时文件并获取上传签名（单文件直传）
 */
export function createTempFileAndGetSign(data) {
  return request({
    url: '/cos/create-temp-file',
    method: 'post',
    data
  })
}

/**
 * 创建分片上传签名（初始化分片上传，返回 uploadId、key 等）
 * 后端应调用 COS InitMultipartUpload，返回 uploadId、key、cosUrl 等
 */
export function createMultipartUploadSign(data) {
  return request({
    url: '/cos/create-multipart-upload',
    method: 'post',
    data
  })
}

/**
 * 获取单个分片的预签名 URL（前端每个分片上传前调用）
 * 参数应包含 { key, uploadId, partNumber }
 * 后端返回单个分片上传用的预签名 URL（PUT）
 */
export function signPart(data) {
  return request({
    url: '/cos/sign-part',
    method: 'post',
    data
  })
}

/**
 * 完成分片上传（CompleteMultipartUpload），传入 parts 列表
 * parts: [{ PartNumber: n, ETag: "etag" }, ...]
 */
export function completeMultipartUpload(data) {
  return request({
    url: '/cos/complete-multipart-upload',
    method: 'post',
    data
  })
}

/**
 * 中止分片上传（AbortMultipartUpload），如需取消上传使用
 */
export function abortMultipartUpload(data) {
  return request({
    url: '/cos/abort-multipart-upload',
    method: 'post',
    data
  })
}

/**
 * 前端直传文件到COS（表单 POST 的方式，保留你已有实现）
 * 注意：这个函数示例是你之前给出的，某些后端策略下使用 form 上传
 */
export async function uploadFileDirectToCOS(cosUrl, file, signature) {
  const formData = new FormData()
  formData.append('key', signature.key)
  formData.append('success_action_status', '200')
  formData.append('Signature', signature.signature)
  formData.append('x-cos-security-token', signature.token)
  formData.append('file', file)

  return fetch(cosUrl, {
    method: 'POST',
    body: formData
  })
}

/**
 * 其余文件相关接口（你现有的）
 */
export function submitFileForm(data) {
  return request({
    url: '/cos/submit-form',
    method: 'post',
    data
  })
}
export function downloadFileFromCOS(fileId) {
  return request({
    url: `/cos/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}
export function getCOSFileList(params) {
  return request({
    url: '/cos/files',
    method: 'get',
    params
  })
}
export function getCOSFileInfo(fileId) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'get'
  })
}
export function deleteCOSFile(fileId) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'delete'
  })
}
export function updateCOSFile(fileId, data) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'put',
    data
  })
}
export function getCOSFilePreviewUrl(fileId) {
  return request({
    url: `/cos/preview/${fileId}`,
    method: 'get'
  })
}
