import { ELEMENT_MASTER, ELEMENT_COLLECT, ELEMENT_CONTEXT } from "./constants";
import { remove, append, replace } from "./dom";
import { VDom, h, isDom } from "./vdom";
/**
 * Analyze if prev Node has or does not have a state defined by the diff process,
 * this is left linked to the node to avoid its loss either by external editing.
 *
 * @param {HTMLELement} [parent] - If the father is defined, the remove function is activated,
 *                                 it allows to remove the nodes from the father
 * @param {HTMLELement} [prevNode] - Node that can possess the previous state
 * @param {Object} next - Next render state
 * @param {Object} slots - Group the slots to be retrieved by the special slot tag
 * @param {*} context - allows to share information within the children of the component
 * @param {Boolean} svg - define if the html element is a svg
 * @return {HTMLELement} - returns the current node.
 */
export function diff(parent, prevNode, next, slots = {}, context, isSvg) {
    let prev = (prevNode && prevNode[ELEMENT_MASTER]) || new VDom(),
        nextNode = prevNode,
        nextMaster = next;

    if (next) {
        let isSlot = next.tag === "slot";

        next = slot(next, slots);
        prev = slot(prev, slots);

        isSvg = isSvg || next.tag === "svg";

        if (parent) {
            if (prev.tag !== next.tag) {
                nextNode = isDom(next.tag)
                    ? next.tag
                    : next.tag
                        ? isSvg
                            ? document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  next.tag
                              )
                            : document.createElement(next.tag)
                        : document.createTextNode("");
                if (prevNode) {
                    replace(parent, nextNode, prevNode);
                    while (!isSlot && !next.collect && prevNode.firstChild) {
                        append(nextNode, prevNode.firstChild);
                    }
                } else {
                    append(parent, nextNode);
                }
            }
        }

        if (nextNode.nodeType === 3) {
            if (prev.children[0] !== next.children[0])
                nextNode.textContent = next.children[0];
        } else {
            if (nextNode && nextNode[ELEMENT_CONTEXT]) {
                context = nextNode[ELEMENT_CONTEXT](context);
            }
            let collect = (parent && nextNode[ELEMENT_COLLECT]) || {},
                props = diffProps(
                    nextNode,
                    next.tag === prev.tag ? prev.props : {},
                    next.props,
                    isSvg,
                    /**
                     * It allows to obtain properties of the iteration of diff by properties
                     */
                    collect.props
                );
            if (collect.handler) {
                props.children = next.children.map(
                    vdom => (vdom.tag ? vdom : vdom.children[0])
                );
                collect.handler(props);
            } else {
                if (!isSlot && nextNode) {
                    let children = Array.from(
                            (nextNode.shadowRoot || nextNode).childNodes
                        ),
                        length = Math.max(
                            children.length,
                            next.children.length
                        );
                    for (let i = 0; i < length; i++) {
                        diff(
                            nextNode,
                            children[i],
                            next.children[i],
                            slots,
                            context,
                            isSvg
                        );
                    }
                }
            }
        }
    } else {
        if (parent && prevNode) {
            remove(parent, prevNode);
        }
    }
    nextNode[ELEMENT_MASTER] = nextMaster;
    return nextNode;
}

export function Collect(node, props, handler) {
    this.observer = node[ELEMENT_COLLECT] = { props, handler };
}

export function Context(node, handler, prop = "context") {
    node[ELEMENT_CONTEXT] = context => {
        return (node[prop] = handler(context) || context);
    };
}

/**
 * compares the attributes associated with the 2 render states
 * @param {HTMLELement} node
 * @param {Object} prev - properties that the node already has
 * @param {Object} next - object with the new properties to define the node
 * @param {Boolean} [svg] - define if the html element is a svg
 * @param {Object} [collect] -It allows to recover properties, avoiding in turn the analysis
 *                            of these on the node, these are returned in an object in association
 *                            with the key of the loop
 * @param {Boolean} [nextMerge] - it allows not to eliminate the properties of the previous state and add them to the next state
 * @return {Object} Collected properties
 */
function diffProps(node, prev, next, isSvg, collect) {
    // generates a list of the existing attributes in both versions
    let keys = Object.keys(prev).concat(Object.keys(next)),
        length = keys.length,
        props = {};
    for (let i = 0; i < length; i++) {
        let prop = keys[i];

        if (isSvg && prop === "xmlns") continue;
        if (prev[prop] !== next[prop]) {
            if (collect && collect.indexOf(prop) > -1) {
                props[prop] = next[prop];
                continue;
            }

            let isFnNext = typeof next[prop] === "function",
                isFnPrev = typeof prev[prop] === "function";

            if (isFnNext || isFnPrev) {
                if (isFnPrev) node.removeEventListener(prop, prev[prop]);
                if (isFnNext) node.addEventListener(prop, next[prop]);
            } else if (prop in next) {
                if ((prop in node && !isSvg) || (isSvg && prop === "style")) {
                    if (prop === "style") {
                        if (typeof next[prop] === "object") {
                            let prevStyle = prev[prop] || {},
                                nextStyle = next[prop];
                            for (let prop in nextStyle) {
                                if (prevStyle[prop] !== nextStyle[prop]) {
                                    if (prop[0] === "-") {
                                        node.setProperty(prop, nextStyle[prop]);
                                    } else {
                                        node.style[prop] = nextStyle[prop];
                                    }
                                }
                            }
                            next[prop] = { ...prevStyle, ...nextStyle };
                        } else {
                            node.style.cssText = next[prop];
                        }
                    } else {
                        node[prop] = next[prop];
                    }
                } else {
                    isSvg
                        ? node.setAttributeNS(null, prop, next[prop])
                        : node.setAttribute(prop, next[prop]);
                }
            } else {
                if (collect) {
                    next[prop] = prev[prop];
                } else {
                    node.removeAttribute(prop);
                }
            }
        }
    }
    return props;
}
/**
 *
 * @param {VDom} vdom - It allows to identify if this node requires the use of a slot
 * @param {Object} slots - Object that has living nodes associated by an index
 */
function slot(vdom, slots) {
    if (vdom.tag === "slot") {
        vdom = vdom.clone(slots[vdom.props.name] || "");
        delete vdom.props.name;
        return vdom;
    }
    return vdom;
}
