// 来源: https://github.com/livoras/list-diff/blob/master/lib/diff.js
/**
 * Diff two list in O(N).
 * 比较2个列表, 算法复杂度为O(N)
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - { moves: <Array> }
 *                  - moves is a list of actions that telling how to remove and insert
 *                  - moves是一系列动作, 告诉怎样删除和插入(移动可以看成是删除和插入操作的结合)
 */
export default function diff(oldList, newList, key) {
    var oldMap = makeKeyIndexAndFree(oldList, key)
    var newMap = makeKeyIndexAndFree(newList, key)

    var newFree = newMap.free

    var oldKeyIndex = oldMap.keyIndex
    var newKeyIndex = newMap.keyIndex

    var moves = []

    // a simulate list to manipulate
    // 一个模拟操作列表
    var children = [] 
    var i = 0
    var item
    var itemKey
    var freeIndex = 0

    // first pass to check item in old list: if it's removed or not
    // 首先检查oldList列表项: 它是否需要删除
    /*
        假设:
            oldList: a   b   c    d    e    f    g    h    i
            newList: a   b   c    h    d    f    g    j    i   m   n --> 删除了e, 插入了j, m, n, 移动了d, h
        那么
           children: a   b   c    d   null  f    g    h    i   --> ps: 每一项都有key, 除了需要删除的为null, 其它项和原oldList保持一致
           children: a   b   c    h    d    f    g    j    i   --> ps: 每一项都没有key, 此时每一项都是newList中的
           ps: children和oldList的长度一致
    */
    while (i < oldList.length) {
        item = oldList[i]
        itemKey = getItemKey(item, key)
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {// 不在newList列表中, 表示被删除了
                children.push(null) // null放到children
            } else {
                var newItemIndex = newKeyIndex[itemKey] // 取得在newList列表中的index(位置)
                children.push(newList[newItemIndex]) // newList中对应项放到children
            }
        } else {
            var freeItem = newFree[freeIndex++]
            children.push(freeItem || null) // newFree中对应项放到children
        }
        i++
    }

    // children复制一份
    var simulateList = children.slice(0) 

    // remove items no longer exist
    // 删除不存在的项
    i = 0
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            remove(i) // 标记需要删除
            removeSimulate(i) // 从simulateList数组中删除
        } else {
            i++
        }
    }
    /*
        ps: 删除数组元素是会更改索引的, 从后往前删可以保证索引不变
        所以上面代码, 也可以这样写:

        var length = simulateList.length
        for (var i = length - 1; i >= 0; i--) {
            // 判断当前元素是否为空，为空表示需要删除
            if (simulateList[i] === null) {
                remove(i)
                removeSimulate(i)
            }
        }
    */


    // i is cursor pointing to a item in new list
    // i光标指向newList中的项
    // j is cursor pointing to a item in simulateList
    // j光标指向simulateList中的项
    var j = i = 0
    while (i < newList.length) {
        item = newList[i]
        itemKey = getItemKey(item, key)

        var simulateItem = simulateList[j]
        var simulateItemKey = getItemKey(simulateItem, key)

        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++
            } else {
                // new item, just inesrt it
                // 新项, 插入
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item)
                } else {
                    // if remove current simulateItem make item in right place
                    // then just remove it
                    // 如果移除当前simulateItem项, 使之对应, 那就移除它
                    var nextItemKey = getItemKey(simulateList[j + 1], key)
                    if (nextItemKey === itemKey) {
                        remove(i)
                        removeSimulate(j)
                        j++ // after removing, current j is right, just jump to next one // 移除之后, j在正确的位置, 指向下一位
                    } else {
                        // else insert item
                        // 否则 插入
                        insert(i, item)
                    }
                }
            }
        } else {
            insert(i, item) // 插入
        }

        i++
    }

    //if j is not remove to the end, remove all the rest item
    var k = simulateList.length - j
    while (j++ < simulateList.length) {
        k--
        remove(k + i)
    }

    function remove(index) {
        var move = {
            index: index,
            type: 0 // 删除
        }
        moves.push(move)
    }

    function insert(index, item) {
        var move = {
            index: index,
            item: item,
            type: 1 // 插入
        }
        moves.push(move)
    }

    function removeSimulate(index) {
        simulateList.splice(index, 1)
    }

    return {
        moves: moves,
        children: children
    }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
    var keyIndex = {}
    var free = []
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i]
        var itemKey = getItemKey(item, key)
        if (itemKey) {// 如果有key存在
            keyIndex[itemKey] = i
        } else { // 不存在key
            free.push(item)
        }
    }
    return {
        keyIndex: keyIndex,
        free: free
    }
}

// 取得item项的key
function getItemKey(item, key) {
    if (!item || !key) return void 666
    return typeof key === 'string' ? item[key] : key(item) // key也可能是方法?
}


export { diff, makeKeyIndexAndFree }