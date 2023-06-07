import { css } from 'lit';
export default css `::-webkit-scrollbar {
  width: 14px;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
}

::-webkit-scrollbar-track {
  background: #0F1016;
}

* {
  scrollbar-color: #666 #0F1016;
}

:host {
  display: block;
}
:host * {
  box-sizing: border-box;
}
:host > div {
  z-index: 1001;
  height: 100%;
}
:host > div .blackout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.4);
}
:host > div > .slide-outer {
  float: left;
  position: relative;
  width: 0px;
  height: 100%;
  z-index: 2;
}
:host > div > .slide-outer > .slide {
  float: left;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  background: #262a37;
}
:host > div > .slide-outer > .slide > .inner {
  width: 100%;
  height: 100%;
}
:host > div > .slide-outer > .slide > .inner > .content {
  position: relative;
  height: 100%;
  overflow: auto;
}
:host > div > .slide-outer > .slide > .drag {
  display: none;
  position: absolute;
  left: 100%;
  top: 10%;
  height: 80%;
  padding: 54px 3px 6px 3px;
}
:host > div > .slide-outer > .slide > .drag, :host > div > .slide-outer > .slide > .drag * {
  cursor: e-resize;
}
:host > div > .slide-outer > .slide > .drag > div {
  width: 2px;
  height: 100%;
  border: 1px dotted rgba(255, 255, 255, 0.3);
}
:host > div > .slide-outer > .slide > .drag:hover > div {
  border: 1px dotted #CEE61B;
}
:host > div > .slide-outer.open {
  border-right: 1px solid rgba(0, 0, 0, 0.4);
  right: 0;
}
:host > div > .slide-outer.open > .slide > .drag {
  display: block;
}`;
//# sourceMappingURL=drawer.lit.css.js.map