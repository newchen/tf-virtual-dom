import * as _  from './util'

/**
 * Virtual-dom Element.
 * @param {String} tagName
 * @param {Object} props - Element's properties,
 *                       - using object to store key-value pair
 * @param {Array<Element|String>} - This element's children elements.
 *                                - Can be Element instance or just a piece plain text.
 */
export default function Element(tagName, props, children) {
    if (!(this instanceof Element)) { // 不是Element实例
        // children不是数组形式, 可能是其它: 多个字符串, 元素之类
        if (!_.isArray(children) && children != null) {
            // _.truthy: 过滤: 空字符串, 0, false, null, undeifined等的children, 
            // 思考: filter函数是不是不需要会更好? 0和false是不是不应该过滤? 这主要是用来过滤null, 空字符串, undeifined之类的children吧?
            children = _.slice(arguments, 2).filter(_.truthy)
        }
        return new Element(tagName, props, children)
    }

    // 此时传入的props其实是children
    if (_.isArray(props)) {
        children = props 
        props = {}
    }

    this.tagName = tagName
    this.props = props || {}
    this.children = children || [] // 这里是不是也应该过滤: 空字符串, null, undeifined之类?
    // void 666 === undefined --> true
    this.key = props ? props.key : void 666

    /* 
        节点标识, 如下(括号中的就是节点标识):
                 div(0)
                /  |   \
               /   |    \
            p(1)  ul(3)  div(7)
           /     / |  \     \
         /      /  |   \     \
    'a'(2) li(4) li(5) li(6) 'hello'(8)

    */
    var count = 0

    _.each(this.children, function(child, i) {
        if (child instanceof Element) {
            count += child.count
        } else {
            children[i] = '' + child // child转为字符串
        }
        count++ // count加一
    })

    this.count = count
}

/**
 * Render the hold element tree.
 */
Element.prototype.render = function() {
    var el = document.createElement(this.tagName)
    var props = this.props

    for (var propName in props) {
        var propValue = props[propName]
        _.setAttr(el, propName, propValue)
    }

    _.each(this.children, function(child) {
        var childEl = (child instanceof Element) 
            ? child.render() 
            : document.createTextNode(child)

        el.appendChild(childEl)
    })

    return el
}

// 通过Element方法创建的虚拟dom创建实际dom节点
function create(Element) {
    return Element.render()
}

export { Element, create }
