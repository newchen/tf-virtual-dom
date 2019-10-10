import * as _  from './util'

var REPLACE = 0 // 替换掉原来的节点
var REORDER = 1 // 移动、删除、新增子节点
var PROPS = 2 // 修改了节点的属性
var TEXT = 3 // 文本改变

export default function patch(node, patches) {
    var walker = { index: 0 }
    dfsWalk(node, walker, patches)

    return node
}

function dfsWalk(node, walker, patches) {
    var currentPatches = patches[walker.index] // 从patches拿出当前节点的差异

    var len = node.childNodes ? node.childNodes.length : 0

    for (var i = 0; i < len; i++) { // 深度遍历子节点
        var child = node.childNodes[i]
        walker.index++
        dfsWalk(child, walker, patches)
    }

    if (currentPatches) {
        applyPatches(node, currentPatches) // 对当前节点进行DOM操作
    }
}

function applyPatches(node, currentPatches) {
    _.each(currentPatches, function(currentPatch) {
        switch (currentPatch.type) {
            case REPLACE:// 替换
                var newNode = (typeof currentPatch.node === 'string') 
                    ? document.createTextNode(currentPatch.node) 
                    : currentPatch.node.render()

                node.parentNode.replaceChild(newNode, node)
                break
            case REORDER: // 重排
                reorderChildren(node, currentPatch.moves)
                break
            case PROPS: // 属性
                setProps(node, currentPatch.props)
                break
            case TEXT: // 文本
                if (node.textContent) {
                    node.textContent = currentPatch.content
                } else {
                    // fuck ie
                    node.nodeValue = currentPatch.content
                }
                break
            default:
                throw new Error('Unknown patch type ' + currentPatch.type)
        }
    })
}

function setProps(node, props) {
    for (var key in props) {
        if (props[key] === void 666) {
            // node.removeAttribute(key)
            _.removeAttr(node, key)
        } else {
            var value = props[key]
            _.setAttr(node, key, value)
        }
    }
}

function reorderChildren(node, moves) {
    // 注意: 这里staticNodeList其实对node.childNodes做了一份拷贝, node节点的操作不会影响到staticNodeList
    var staticNodeList = _.toArray(node.childNodes)
    var maps = {}

    _.each(staticNodeList, function(node) {
        if (node.nodeType === 1) { // 是元素
            var key = node.getAttribute('key')
            if (key) {
                maps[key] = node
            }
        }
    })

    _.each(moves, function(move) {
        var index = move.index
        if (move.type === 0) { // remove item
            if (staticNodeList[index] === node.childNodes[index]) { // maybe have been removed for inserting
                node.removeChild(node.childNodes[index])
            }
            staticNodeList.splice(index, 1)
        } else if (move.type === 1) { // insert item
            var insertNode = maps[move.item.key] 
                ? maps[move.item.key].cloneNode(true) // reuse old item
                : (typeof move.item === 'object') 
                    ? move.item.render() 
                    : document.createTextNode(move.item)

            staticNodeList.splice(index, 0, insertNode)
            node.insertBefore(insertNode, node.childNodes[index] || null)
        }
    })
}

patch.REPLACE = REPLACE // 替换
patch.REORDER = REORDER // 重排
patch.PROPS = PROPS // 属性
patch.TEXT = TEXT // 文本

export { patch }