import request from '@/utils/request'
/**
 * 上传文件，folder 逻辑分类
 * @param {File} file
 * @param {String} folder
 * @param {String} [fixedFileName] 可选
 */
export function uploadFile(file, folder, fixedFileName = '') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  if (fixedFileName) formData.append('fixedFileName', fixedFileName)

  return request({
    url: '/upload/file',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 获取 COS 签名
 * @param {String} fileKey
 */
export function getCosSignature(fileKey) {
  return request({
    url: '/upload/cos-signature',
    method: 'get',
    params: { fileKey }
  })
}
