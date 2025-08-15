import request from '@/utils/request';

// 1. 查询所有标签
export function getAllTags() {
  return request.get('/tags');
}

// 2. 根据ID查询单个标签
export function getTagById(id) {
  return request.get(`/tags/${id}`);
}

// 3. 根据大分类查询标签列表
export function getTagByCategory(category) {
  return request.get('/tags/category', {
    params: { category }
  });
}

// 4. 新增标签
export function addTag(tag) {
  return request.post('/tags', tag);
}

// 5. 更新标签
export function updateTag(id, tag) {
  return request.put(`/tags/${id}`, tag);
}

// 6. 删除标签
export function deleteTag(id) {
  return request.delete(`/tags/${id}`);
}
