// src/utils/request.js
import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:11451/api', // 后端接口地址（确保端口匹配）
  timeout: 5000
})

export default request
