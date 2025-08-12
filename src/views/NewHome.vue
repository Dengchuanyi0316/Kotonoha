<template>
  <div class="container">
    <h1>关系图展示</h1>
    <div id="graphChart" class="chart-container"></div>
    <button @click="addComponent" class="add-btn">添加组件</button>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import * as echarts from 'echarts'

const myChart = ref(null)
const graphData = reactive({
  nodes: [],
  links: []
})

const updateNodeSizes = () => {
  graphData.nodes.forEach(node => {
    const linksCount = graphData.links.filter(link =>
      link.source === node.id || link.target === node.id
    ).length
    node.symbolSize = Math.min(40 + linksCount * 5, 60)
  })
}

// 提取图表配置为独立方法
const setChartOption = () => {
  const option = {
    tooltip: {},
    animationDurationUpdate: 750,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 300,
        edgeLength: 150,
        layoutAnimation: true,
        edgeSymbolSize: [4, 20],
        friction: 0.4
      },
      roam: false,
      draggable: true,
      label: { show: true, position: 'bottom', fontSize: 14 },
      itemStyle: {
        color: params => {
          const colorMap = {
            'vue': '#41b883',
            'ts': '#3178c6',
            'js': '#f7df1e',
            'json': '#f16529',
            'css': '#e34f26',
            'html': '#2965f1',
            'jsx': '#61dafb',
            'tsx': '#007acc',
            'other': '#999999'
          }
          return colorMap[params.data.type] || colorMap['other']
        }
      },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 10],
      edgeLabel: { fontSize: 12 },
      data: graphData.nodes,
      links: graphData.links,
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0
      }
    }]
  }
  myChart.value.setOption(option)
}

// 添加动态添加节点的逻辑
const addComponent = () => {
  const newNode = {
    id: 'NewComponent' + Math.random().toString(36).substr(2, 5),
    name: 'NewComponent',
    type: 'other', // 默认类型
    value: 20
  }
  graphData.nodes.push(newNode)
  // 添加一条到App的连接
  graphData.links.push({ source: 'App', target: newNode.id })
  updateNodeSizes()
  myChart.value.setOption({
    series: [{
      data: graphData.nodes,
      links: graphData.links,
    }]
  })
}

onMounted(async () => {
  // 初始化图表
  myChart.value = echarts.init(document.getElementById('graphChart'))

  try {
    // 加载JSON数据
    const response = await fetch('/graphData.json')
    const jsonData = await response.json()

    // 更新响应式数据
    graphData.nodes = jsonData.nodes
    graphData.links = jsonData.links

    updateNodeSizes()
    setChartOption()
  } catch (error) {
    console.error('加载关系图数据失败:', error)
    // 加载失败时使用默认数据
    graphData.nodes = [/* 默认节点数据 */]
    graphData.links = [/* 默认链接数据 */]
    updateNodeSizes()
    setChartOption()
  }

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.value.resize()
  })
})

</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 20px;
  box-sizing: border-box;
}

.chart-container {
  width: 100%;
  height: 800px;
  min-height: 600px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.add-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
