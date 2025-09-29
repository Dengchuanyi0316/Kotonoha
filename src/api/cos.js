import request from '@/utils/request'

/**
 * 创建临时文件并获取上传签名
 * @param {Object} data - 文件信息（文件名、大小、类型等）
 * @returns {Promise}
 */
export function createTempFileAndGetSign(data) {
  return request({
    url: '/cos/create-temp-file',
    method: 'post',
    data
  })
}

/**
 * 前端直传文件到COS
 * 注意：这是一个客户端直接调用COS API的函数，不是通过后端代理
 * @param {String} cosUrl - COS上传地址
 * @param {File} file - 要上传的文件
 * @param {Object} signature - 签名信息
 * @returns {Promise}
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
 * 提交文件表单并将临时文件转为正式文件
 * @param {Object} data - 包含表单数据和fileId列表
 * @returns {Promise}
 */
export function submitFileForm(data) {
  return request({
    url: '/cos/submit-form',
    method: 'post',
    data
  })
}

/**
 * 从腾讯COS下载文件
 * @param {String} fileId - 文件ID
 * @returns {Promise}
 */
export function downloadFileFromCOS(fileId) {
  return request({
    url: `/cos/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取文件列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getCOSFileList(params) {
  return request({
    url: '/cos/files',
    method: 'get',
    params
  })
}

/**
 * 获取单个文件信息
 * @param {String} fileId - 文件ID
 * @returns {Promise}
 */
export function getCOSFileInfo(fileId) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'get'
  })
}

/**
 * 删除文件
 * @param {String} fileId - 文件ID
 * @returns {Promise}
 */
export function deleteCOSFile(fileId) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'delete'
  })
}

/**
 * 更新文件信息
 * @param {String} fileId - 文件ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateCOSFile(fileId, data) {
  return request({
    url: `/cos/file/${fileId}`,
    method: 'put',
    data
  })
}

/**
 * 获取文件预览URL
 * @param {String} fileId - 文件ID
 * @returns {Promise}
 */
export function getCOSFilePreviewUrl(fileId) {
  return request({
    url: `/cos/preview/${fileId}`,
    method: 'get'
  })
}
