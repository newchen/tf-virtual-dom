## 虚拟dom(源码解析)

来源: https://github.com/livoras/blog/issues/13


### 示例

```
import { h, diff, patch } from 'tf-virtual-dom'

// 1. 构建虚拟DOM
var tree = h('div', {'id': 'container'}, [
    h('h1', {style: 'color: blue', key: 1}, ['simple virtal dom']),
    h('p', { key: 2}, ['Hello, virtual-dom']),
    h('ul', { key: 3}, [h('li', ['li-1'])])
])
// var tree = h('div', {'id': 'container'}, 
//     [0, false, null, '',
//     h('h1', {style: 'color: blue', key: 1}, ['simple virtal dom']),
//     h('p', { key: 2}, ['Hello, virtual-dom']),
//     h('ul', { key: 3}, [h('li', ['li-1'])])]
// )
 
// 2. 通过虚拟DOM构建真正的DOM
var root = tree.render()
document.body.appendChild(root)
 
// 3. 生成新的虚拟DOM
var newTree = h('div', {'id': 'container'}, [
    h('h1', {style: 'color: blue', key: 1}, ['simple virtal dom']),
    h('p', { key: 2}, ['Hello, virtual-dom']),
    h('ul', { key: 3}, [h('li', ['li-1'])]),
    h('div', ['test']),
])

// setTimeout(() => {
//   // 4. 比较两棵虚拟DOM树的不同
//   var patches = diff(tree, newTree)
//   console.log('patches:',patches)
//    
//   // 5. 在真正的DOM元素上应用变更
//   patch(root, patches)
// }, 3000)

```