<template>
  <div class="container">
    <h1>关系图展示</h1>
    <div id="graphChart" class="chart-container"></div>
    <button @click="addComponent" class="add-btn">添加组件</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { reactive } from 'vue'

const myChart = ref(null)

onMounted(() => {
  // 初始化图表
  myChart.value = echarts.init(document.getElementById('graphChart'))


  // 图表配置
  const option = {
    tooltip: {},
    animationDurationUpdate: 750, // 添加拖动动画持续时间
    animationEasingUpdate: 'quinticInOut', // 设置动画缓动效果
    series: [{
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 300, // 增加斥力使节点分散更开
        edgeLength: 150, // 增加连线长度
        layoutAnimation: true,
        // 添加力导向参数使拖动时影响其他节点
        edgeSymbolSize: [4, 20],
        friction: 0.6 // 摩擦系数，控制动画衰减速度
      },
      roam: false, // 禁用整体拖动
      draggable: true, // 启用节点拖拽
      label: {
        show: true,
        position: 'bottom',
        fontSize: 14,// 调整文字大小
      },
      // 根据连接数动态计算节点大小,待实现
      symbolSize: 40,

      // 根据节点类型设置颜色
      itemStyle: {
        color: function(params) {
          // 定义不同类型对应的颜色
          const colorMap = {
            'vue': '#41b883',
            'ts': '#3178c6',
            'js': '#f7df1e',
            'json': '#f16529',
            'css': '#2965f1',
            'html': '#e34f26',
            'jsx': '#61dafb',
            'tsx': '#007acc',
            'other': '#999999'
          };
          // 返回对应颜色，默认为other
          return colorMap[params.data.type] || colorMap['other'];
        }
      },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 10],
      edgeLabel: {
        fontSize: 12
      },
      data: graphData.nodes,
      links: graphData.links,
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0, // 连线弯曲度
        elasticity: 0.6 // 连线弹性，实现伸缩效果
      }
    }]
  }

  // 设置配置项并渲染图表
  myChart.value.setOption(option)

  // 添加节点拖拽功能
  myChart.value.on('dragend', function(params) {
    if (params.dataType === 'node') {
      const node = graphData.nodes.find(n => n.id === params.data.id)
      if (node) {
        node.fixed = true
        node.x = params.targetX
        node.y = params.targetY
        myChart.value.setOption({ series: [{ data: graphData.nodes }] })
      }
    }
  })

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.value.resize()
  })
})

// 初始化图表数据
const graphData = reactive({
  nodes: [
    { id: 'App', name: 'App', type: 'vue', value: 50, fixed: true, x: 400, y: 300 },
    { id: 'Home', name: 'Home', type: 'vue', value: 30 },
    { id: 'NoteEditor', name: 'NoteEditor', type: 'tsx', value: 30 },
    { id: 'NewHome', name: 'NewHome', type: 'vue', value: 30 }
  ],
  links: [
    { source: 'App', target: 'Home' },
    { source: 'App', target: 'NoteEditor' },
    { source: 'Home', target: 'NewHome' }
  ]
})

// 添加动态添加节点的方法
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
  myChart.value.setOption({
    series: [{
      data: graphData.nodes,
      links: graphData.links,
    }]
  })
}
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
