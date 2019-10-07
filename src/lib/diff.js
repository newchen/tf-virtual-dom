import * as _  from './util'
import patch from './patch'
import { diff as listDiff } from './list-diff'

export default function diff(oldTree, newTree) {
    var index = 0
    var patches = {}
    dfsWalk(oldTree, newTree, index, patches)
    return patches
}

function dfsWalk(oldNode, newNode, index, patches) {
    var currentPatch = []

    // Node is removed.
    // 节点移除, ps: listDiff返回的children中的项可能是null
    if (newNode === null) {
        // Real DOM node will be removed when perform reordering, so has no needs to do anthings in here
        // 重排的时候真实的DOM节点将被移除, 所以这里什么都不需要做

        // TextNode content replacing
        // 替换TextNode内容
    } else if (_.isString(oldNode) && _.isString(newNode)) {
        if (newNode !== oldNode) {
            currentPatch.push({
                type: patch.TEXT,
                content: newNode
            })
        }
        // Nodes are the same, diff old node's props and children
        // 节点相同, 比较节点的属性和子节点
    } else if (
        oldNode.tagName === newNode.tagName &&
        oldNode.key === newNode.key
    ) {
        // Diff props 
        // 比较属性
        var propsPatches = diffProps(oldNode, newNode)
        if (propsPatches) {
            currentPatch.push({
                type: patch.PROPS,
                props: propsPatches
            })
        }
        // Diff children. If the node has a `ignore` property, do not diff children
        // 比较子节点, 如果某个节点有ignore属性, 就不比较它的子节点
        if (!isIgnoreChildren(newNode)) {
            diffChildren(
                oldNode.children,
                newNode.children,
                index,
                patches,
                currentPatch
            )
        }
        // Nodes are not the same, replace the old node with new node
        // 节点不一样, 用新节点替换旧节点
    } else {
        currentPatch.push({
            type: patch.REPLACE,
            node: newNode
        })
    }

    if (currentPatch.length) {
        patches[index] = currentPatch
    }
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
    // -------- list diff start --------
    var diffs = listDiff(oldChildren, newChildren, 'key')
    newChildren = diffs.children

    if (diffs.moves.length) {
        var reorderPatch = {
            type: patch.REORDER,
            moves: diffs.moves
        }
        currentPatch.push(reorderPatch)
    }
    // -------- list diff end --------

    var leftNode = null
    var currentNodeIndex = index
    /* 
        这里只遍历了oldChildren, 假设newChildren比oldChildren要多长, 
        依赖于listDiff中插入逻辑: 
        if (simulateItem) { 
            ... 
        } else{ 
            insert(i, item) 
        }
    */
    _.each(oldChildren, function(child, i) {
        var newChild = newChildren[i]
        currentNodeIndex = (leftNode && leftNode.count) // 计算节点的标识
            ? currentNodeIndex + leftNode.count + 1 : 
            currentNodeIndex + 1
        dfsWalk(child, newChild, currentNodeIndex, patches) // 深度遍历子节点
        leftNode = child
    })
}

function diffProps(oldNode, newNode) {
    var count = 0
    var oldProps = oldNode.props
    var newProps = newNode.props

    var key, value
    var propsPatches = {}

    // Find out different properties
    // 找出不同的属性
    for (key in oldProps) {
        value = oldProps[key]
        if (newProps[key] !== value) {
            count++
            propsPatches[key] = newProps[key]
        }
    }

    // Find out new property
    // 找出新属性
    for (key in newProps) {
        value = newProps[key]
        if (!oldProps.hasOwnProperty(key)) {
            count++
            propsPatches[key] = newProps[key]
        }
    }

    // If properties all are identical
    // 如果属性都是相同的
    if (count === 0) {
        return null
    }

    return propsPatches
}

function isIgnoreChildren(node) {
    return (node.props && node.props.hasOwnProperty('ignore'))
}

export { diff }
