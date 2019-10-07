
export function type(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
}

export function isArray(list) {
    return type(list) === 'Array'
}

export function slice(arrayLike, index) {
    // return [].slice.call(arrayLike, index)

    //兼容IE9以下
    var rs = [], len = arrayLike.length;

    try {  
        rs = [].slice.call(arrayLike, index); 
    } catch(e){//for IE  
        for(var i = index; i < len; i++){  
            rs[i] = arrayLike[i];
        }                     
    }  
    
    return rs;   
}

export function truthy(value) {
    return !!value
}

export function isString(list) {
    return type(list) === 'String'
}

export function each(array, fn) {
    for (var i = 0, len = array.length; i < len; i++) {
        fn(array[i], i)
    }
}

export function toArray(listLike) {
    if (!listLike) {
        return []
    }

    var list = []

    for (var i = 0, len = listLike.length; i < len; i++) {
        list.push(listLike[i])
    }

    return list
}

function isEvent(name) {
    return /on([A-Z].+)/.test(name)
}

// 还可以优化
export function setAttr(node, key, value) {
    if (isEvent(key)) {
        var evtName = RegExp.$1.toLowerCase();
        return node.addEventListener(evtName, value)
        // 兼容IE9以下
        // var evtName = 'on' + RegExp.$1.toLowerCase();
        // return node[evtName] = value
    }

    switch (key) {
        case 'style':
            node.style.cssText = value
            break
        case 'value':
            var tagName = node.tagName || ''
            tagName = tagName.toLowerCase()
            if (tagName === 'input' || tagName === 'textarea') {
                node.value = value
            } else {
                // if it is not a input or textarea, use `setAttribute` to set
                node.setAttribute(key, value)
            }
            break
        case 'className':
            node.setAttribute("class", value);
            break
        case 'ref':
            if(typeof value == 'function') {
                value(node)
            }
            break;
        default:
            node.setAttribute(key, value)
            break
    }
}

