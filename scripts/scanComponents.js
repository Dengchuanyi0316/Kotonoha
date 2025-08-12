// scripts/scanComponents.js
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const __dirname = path.resolve(); // 项目根目录
const srcDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'public', 'graphData.json');

// 允许的文件类型
const allowedExts = ['vue', 'ts', 'js', 'json', 'css', 'html', 'jsx', 'tsx'];

function scanComponents() {
  // 获取所有文件（带扩展名）
  const files = glob.sync('**/*.*', {
    cwd: srcDir,
    ignore: ['node_modules/**']
  });

  // 建立绝对路径 => 相对路径的映射，方便精确匹配
  const absPathToRel = {};
  files.forEach(f => {
    const abs = path.resolve(srcDir, f);
    absPathToRel[abs] = f;
  });

  const nodes = [];
  const links = [];

  files.forEach((file) => {
    const ext = path.extname(file).replace('.', '').toLowerCase();
    const type = allowedExts.includes(ext) ? ext : 'other';
    if (!type) return;

    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 唯一id用相对路径去除扩展名
    const id = file.replace(path.extname(file), '');
    // 显示用名字只保留文件名+扩展名
    const name = path.basename(file);

    nodes.push({
      id,
      name,
      type,
      value: 20
    });

    // 精确匹配 import 关系
    const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      let targetPath = match[1];
      if (targetPath.startsWith('.')) {
        // 计算目标文件绝对路径
        let resolvedPath = path.resolve(path.dirname(filePath), targetPath);

        // 可能写import时没带扩展名，尝试补全常见后缀
        const possibleExts = ['', ...allowedExts.map(e => '.' + e)];
        let matchedFile = null;
        for (const extTry of possibleExts) {
          const tryPath = resolvedPath + extTry;
          if (absPathToRel[tryPath]) {
            matchedFile = tryPath;
            break;
          }
        }

        if (matchedFile) {
          const targetRel = absPathToRel[matchedFile];
          const targetId = targetRel.replace(path.extname(targetRel), '');

          // 去重判断：避免重复的link
          const exist = links.some(l => l.source === id && l.target === targetId);
          if (!exist) {
            links.push({ source: id, target: targetId });
          }
        }
      }
    }
  });

  // 删除孤立节点（没有任何连线的节点）
  const connectedNodeIds = new Set();
  links.forEach(link => {
    connectedNodeIds.add(link.source);
    connectedNodeIds.add(link.target);
  });

  const filteredNodes = nodes.filter(node => connectedNodeIds.has(node.id));

  return { nodes: filteredNodes, links };
}

// 删除旧文件
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
  console.log(`已删除旧文件: ${outputFile}`);
}

// 生成新数据
const graphData = scanComponents();
fs.writeFileSync(outputFile, JSON.stringify(graphData, null, 2), 'utf-8');
console.log(`已生成新的依赖图数据: ${outputFile}`);
