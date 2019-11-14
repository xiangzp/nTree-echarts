(function() {
  // 节点权重
  const nodeCount = [];
  // 连接
  const links = [];
  /**
   * 迭代计算权重数和依赖关系（每一个依赖的线source是什么，target是什么）
   */
  function iterateSumCountAndLink(nTreeData) {
    nTreeData.forEach(tree => {
      const _name = tree.name;
      const _child = tree.child;
      setNodeCount(_name, _child || []);
      if (_child) {
        iterateSumCountAndLink(_child);
      }
    });
  }

  /**
   * 计算每个节点的父节点和子节点数
   */
  function setNodeCount(_name, childs) {
    calChildParentNodeCount(_name, childs);
    calChildChildsNodeCount(_name, childs);
  }

  /**
   * 计算子代的父节点连接数
   */
  function calChildParentNodeCount(_name, childs) {
    childs.forEach(child => {
      links.push({
        target: _name,
        source: child.name
      });
      const childIndex = nodeCount.findIndex(node => node.name === child.name);
      if (childIndex < 0) {
        nodeCount.push({
          name: child.name,
          childNode: [],
          parentNode: [_name]
        });
      } else {
        nodeCount[childIndex].parentNode.push(_name);
      }
    });
  }

  /**
   * 计算子代的子节点连接数
   */
  function calChildChildsNodeCount(_name, childs) {
    const crtNodeIndex = nodeCount.findIndex(node => node.name === _name);
    const childCount =
      childs.length <= 0 ? [] : childs.map(child => child.name);
    const hasNode = crtNodeIndex >= 0;
    if (!hasNode) {
      nodeCount.push({
        name: _name,
        childNode: childCount,
        parentNode: []
      });
    } else {
      nodeCount[crtNodeIndex].childNode.concat(childCount);
    }
  }

  /**
   * 计算节点的层级
   */
  function calNodeCount(nodeChilds) {
    const nodes = [];
    nodeChilds.forEach(node => {
      const count = iterateCalNodeDeepLevel(node);
      nodes.push({
        name: node.name,
        node: node,
        count
      });
    });

    return calNodePosition(nodes);
  }

  /**
   * 计算节点的深度
   */
  function iterateCalNodeDeepLevel(node) {
    let deepLevel = 0;
    let remoteLevel = 0;
    const _parentNodes = node.parentNode;
    // 如果节点没有父节点
    if (_parentNodes.length <= 0) {
      return deepLevel;
    }
    // 是否有父节点
    let hasParentNode = false;
    _parentNodes.forEach(pNodeName => {
      nodeCount.forEach(aNode => {
        if (aNode.name === pNodeName) {
          hasParentNode || (remoteLevel += iterateCalNodeDeepLevel(aNode));
          hasParentNode = true;
        }
      });
    });
    if (hasParentNode) {
      deepLevel += 1;
    }
    return deepLevel + remoteLevel;
  }

  /**
   * 计算节点的位置
   */
  function calNodePosition(nodes) {
    const width = 800;
    let levelCounts = {};
    nodes.forEach(node => {
      const _number = node.count;
      if (levelCounts[_number]) {
        levelCounts[_number].push(node);
      } else {
        levelCounts[_number] = [node];
      }
    });
    return nodes.map(node => {
      const levelNodes = levelCounts[node.count];
      const blockCount = levelNodes.length;
      let index = levelNodes.findIndex(ln => ln.name === node.name);
      index < 0 && (index = 0);
      const parentsCount =
        node.count <= 0 ? 0 : levelCounts[node.count - 1].length;
      const containerWidth = parentsCount === 0 ? width : width / parentsCount;
      node.y = 200 * node.count;
      node.x = Math.ceil(width / (blockCount + 1)) * (index + 1);
      return node;
    });
  }

  /**
   * 生成图表
   */
  iterateSumCountAndLink(nTreeData);
  const data = calNodeCount(nodeCount);
  const myChart = echarts.init(document.getElementById("app"));
  const option = {
    title: {
      text: "Graph 简单示例"
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "none",
        symbolSize: 50,
        roam: true,
        label: {
          normal: {
            show: true
          }
        },
        edgeSymbol: ["circle", "arrow"],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          normal: {
            textStyle: {
              fontSize: 20
            }
          }
        },
        data,
        // links: [],
        links: links,
        lineStyle: {
          normal: {
            opacity: 0.9,
            width: 2,
            curveness: -0.1
          }
        }
      }
    ]
  };
  myChart.setOption(option);
})();
