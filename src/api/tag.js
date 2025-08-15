import request from '@/utils/request';
// 根据分类获取标签
export function fetchTagsByCategory() {
  return request.get('/tags');
}
