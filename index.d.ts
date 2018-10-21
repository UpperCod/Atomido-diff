import {VDom} from "./src/vdom";

declare module "atomico-diff"{
    export function h(tag:string,props:object,...children:any):VDom;
    export function diff(parent:HTMLElement|boolean,node:HTMLElement,next:VDom,slots?:object,isSvg?:boolean):HTMLElement;
    export const ELEMENT_COLLECT;
    export const ELEMENT_OBSERVER;
    export function isVDom(tag:any):boolean;
}

