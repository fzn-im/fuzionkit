import { css } from 'lit';
export default css`/**
 * a11y-dark theme for JavaScript, CSS, and HTML
 * Based on the okaidia theme: https://github.com/PrismJS/prism/blob/gh-pages/themes/prism-okaidia.css
 * @author ericwbailey
 */
code[class*=language-],
pre[class*=language-] {
  color: #f8f8f2;
  background: none;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

/* Code blocks */
pre[class*=language-] {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
  border-radius: 0.3em;
}

:not(pre) > code[class*=language-],
pre[class*=language-] {
  background: #2b2b2b;
}

/* Inline code */
:not(pre) > code[class*=language-] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #d4d0ab;
}

.token.punctuation {
  color: #fefefe;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #ffa07a;
}

.token.boolean,
.token.number {
  color: #00e0e0;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #abe338;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
  color: #00e0e0;
}

.token.atrule,
.token.attr-value,
.token.function {
  color: #ffd700;
}

.token.keyword {
  color: #00e0e0;
}

.token.regex,
.token.important {
  color: #ffd700;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

@media screen and (-ms-high-contrast: active) {
  code[class*=language-],
  pre[class*=language-] {
    color: windowText;
    background: window;
  }
  :not(pre) > code[class*=language-],
  pre[class*=language-] {
    background: window;
  }
  .token.important {
    background: highlight;
    color: window;
    font-weight: normal;
  }
  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.keyword,
  .token.operator,
  .token.selector {
    font-weight: bold;
  }
  .token.attr-value,
  .token.comment,
  .token.doctype,
  .token.function,
  .token.keyword,
  .token.operator,
  .token.property,
  .token.string {
    color: highlight;
  }
  .token.attr-value,
  .token.url {
    font-weight: normal;
  }
}
@font-face {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./material-icons.woff2") format("woff2"), url("./material-icons.woff") format("woff");
}
.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

@font-face {
  font-family: "Material Icons Outlined";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./material-icons-outlined.woff2") format("woff2"), url("./material-icons-outlined.woff") format("woff");
}
.material-icons-outlined {
  font-family: "Material Icons Outlined";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

@font-face {
  font-family: "Material Icons Round";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./material-icons-round.woff2") format("woff2"), url("./material-icons-round.woff") format("woff");
}
.material-icons-round {
  font-family: "Material Icons Round";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

@font-face {
  font-family: "Material Icons Sharp";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./material-icons-sharp.woff2") format("woff2"), url("./material-icons-sharp.woff") format("woff");
}
.material-icons-sharp {
  font-family: "Material Icons Sharp";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

@font-face {
  font-family: "Material Icons Two Tone";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("./material-icons-two-tone.woff2") format("woff2"), url("./material-icons-two-tone.woff") format("woff");
}
.material-icons-two-tone {
  font-family: "Material Icons Two Tone";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

:host(fzn-prose-editor) .milkdown {
  box-shadow: none;
  border-radius: 0 0 3px 3px;
  border-width: 0 1px 1px 1px;
  border-style: solid;
  border-color: rgb(67, 76, 94);
}
:host(fzn-prose-editor) .milkdown-menu {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 8px;
}
:host(fzn-prose-editor) .button {
  width: 18px;
  height: 18px;
  margin: 0;
}
:host(fzn-prose-editor) .divider {
  margin: 0;
  min-height: auto;
}
:host(fzn-prose-editor) .menu-selector-wrapper {
  border-right-color: transparent;
  border-left-color: transparent;
}
:host(fzn-prose-editor) .menu-selector {
  width: 110px;
  height: 18px;
  margin: 0;
}
:host(fzn-prose-editor) .icon {
  font-size: 16px;
}`;