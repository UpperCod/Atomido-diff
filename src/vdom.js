import { ELEMENT_OBSERVER, ELEMENT_COLLECT } from "./constants";
/**
 * Create an instance of a virtual node
 * @param {*} tag - be social to the tagName
 * @param {*} props - is associated with the attributes of the tag
 * @param  {...*} children - the children associated with the tag
 * @return {VDom}
 */
export function h(tag, props, ...children) {
    return new VDom(tag, props, concat(children));
}
/**
 * Create an instance of a virtual node
 * @param {*} tag - be social to the tagName
 * @param {*} props - is associated with the attributes of the tag
 * @param  {...*} children - the children associated with the tag
 */

export class VDom {
    constructor(tag, props, children) {
        this.tag = tag;
        this.props = props || {};
        this.children = children || [];
        this.collect = this.props[ELEMENT_COLLECT] || false;
    }
    emit(type, arg) {
        let observer = this.props[ELEMENT_OBSERVER];
        if (typeof observer === "function") observer(type, arg);
    }
    clone(tag = this.tag, props = this.props, children = this.children) {
        return new VDom(tag, props, children);
    }
}
export function isDom(tag) {
    return tag !== null && typeof tag === "object" && tag.nodeType !== 11
        ? true
        : false;
}
/**
 *
 * @param {*} value
 * @return {Boolean}
 */
export function isVDom(value) {
    return typeof value === "object" && value instanceof VDom;
}
/**
 * prepares the children associated with virtual dom, managing to simplify the algorithm of diff
 * @param {*} children - list of children associated with the virtual dom
 * @param {*} merge - array that concatenates all the children independent of the depth of the array
 * @return {Array}
 */
export function concat(children, merge = []) {
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        Array.isArray(child)
            ? concat(child, merge)
            : merge.push(
                  isVDom(child) ? child : new VDom("", {}, [child || ""])
              );
    }
    return merge;
}
