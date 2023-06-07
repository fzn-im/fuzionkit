import { css } from 'lit';
export default css `@keyframes bars-pulse {
  0% {
    background: #788091;
  }
  50% {
    background: #CEE61B;
  }
  100% {
    background: #788091;
  }
}
:host(fzn-new-layout) {
  display: block;
  height: 100%;
}
:host(fzn-new-layout) * {
  box-sizing: border-box;
}
:host(fzn-new-layout) > div {
  background: #1b1d28;
  height: 100%;
}
:host(fzn-new-layout) > div > .app-badge > .content-title > .item, :host(fzn-new-layout) > div > .action-bar > .content-title > .item {
  display: block;
  border-right: 1px solid rgba(0, 0, 0, 0.4);
  padding: 0 0.6rem;
  color: #FFFFFF;
  text-decoration: none;
}
:host(fzn-new-layout) > div > .app-badge > .content-title > .item.clickable, :host(fzn-new-layout) > div > .action-bar > .content-title > .item.clickable {
  cursor: pointer;
}
:host(fzn-new-layout) > div > .app-badge {
  float: left;
  position: absolute;
  height: 3rem;
  overflow: hidden;
  z-index: 1002;
}
:host(fzn-new-layout) > div > .app-badge.has-back {
  position: fixed;
  top: 0;
  left: 0;
}
:host(fzn-new-layout) > div > .app-badge.has-back > div.branding > a.up-action > .back-icon {
  width: 0.9375rem;
}
:host(fzn-new-layout) > div > .app-badge.has-back > div.branding > a.up-action > .menu-icon > .bars {
  left: 0.625rem;
}
:host(fzn-new-layout) > div > .app-badge:not(.has-back) > div.branding {
  width: auto !important;
}
:host(fzn-new-layout) > div > .app-badge:not(.has-back) > .content-title {
  border-left: 1px solid rgba(0, 0, 0, 0.3);
}
:host(fzn-new-layout) > div > .app-badge > div.branding {
  display: inline-block;
  height: 100%;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action {
  float: left;
  display: block;
  height: 100%;
  position: relative;
  z-index: 3;
  cursor: pointer;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action:hover > .menu-icon > .bars .bar {
  animation: none;
  background: #CEE61B;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action:hover > .back-icon i {
  color: #CEE61B;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .back-icon {
  display: block;
  float: left;
  height: 100%;
  width: 0;
  position: relative;
  z-index: 3;
  transition: width 0.15s ease 0s;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .back-icon > fa-icon {
  position: absolute;
  right: 2px;
  display: block;
  line-height: 3rem;
  font-size: 1.5rem;
  color: #FFFFFF;
  padding-left: 0.375rem;
  width: 0.9375rem;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .menu-icon {
  display: block;
  float: left;
  position: relative;
  height: 100%;
  padding-left: 0.5rem;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .menu-icon > .bars {
  display: block;
  position: absolute;
  width: 1.25rem;
  top: 1.0625rem;
  left: 0;
  transition: left 0.2s ease 0s;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .menu-icon > .bars .bar {
  animation: bars-pulse 1.5s infinite;
  display: block;
  width: 100%;
  height: 0.1875rem;
  background: #788091;
  margin-bottom: 0.1875rem;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .menu-icon > .icon {
  position: relative;
  z-index: 3;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  width: 2rem;
  height: 2rem;
  background: transparent;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > a.up-action > .menu-icon > .icon > img {
  border: 0;
  width: 100%;
  height: 100%;
}
:host(fzn-new-layout) > div > .app-badge > div.branding > .title {
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100%;
  position: relative;
  z-index: 3;
  float: left;
  font-family: "Montserrat";
  line-height: 3rem;
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
  height: 100%;
  margin-right: 0.5rem;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3), 1px 1px 0 rgba(0, 0, 0, 0.3);
  text-decoration: none;
}
:host(fzn-new-layout) > div > .app-badge > .content-title {
  vertical-align: top;
  display: inline-block;
  height: 100%;
  line-height: 3rem;
  font-size: 0.8725rem;
  font-weight: normal;
  color: #FFFFFF;
  height: 100%;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3), 1px 1px 0 rgba(0, 0, 0, 0.3);
  text-decoration: none;
}
:host(fzn-new-layout) > div > .app-badge > .content-title > span {
  padding-left: 0.5rem;
}
:host(fzn-new-layout) > div.drawer-open > .app-badge > .branding > .title {
  display: block;
}
:host(fzn-new-layout) > div > .action-bar {
  position: absolute;
  top: 0;
  width: 100%;
  height: 3rem;
  background: #262a37;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  z-index: 1000;
}
:host(fzn-new-layout) > div > .action-bar > .content-title {
  position: absolute;
  vertical-align: top;
  display: inline-block;
  height: 100%;
  line-height: 3rem;
  font-size: 0.8725rem;
  font-weight: normal;
  color: #FFFFFF;
  height: 100%;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3), 1px 1px 0 rgba(0, 0, 0, 0.3);
  text-decoration: none;
}
:host(fzn-new-layout) > div > .action-bar > .content-title > span {
  padding-left: 0.5rem;
}
:host(fzn-new-layout) > div > .action-bar > .right {
  float: right;
  height: 100%;
  display: flex;
}
:host(fzn-new-layout) > div > .action-bar > .right > .voice-widget {
  cursor: pointer;
  display: flex;
  height: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.4);
  align-items: center;
}
:host(fzn-new-layout) > div > .action-bar > .right > .voice-widget, :host(fzn-new-layout) > div > .action-bar > .right > .voice-widget * {
  cursor: pointer;
}
:host(fzn-new-layout) > div > .action-bar > .right > .voice-widget .text {
  margin: 0 0.5rem;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login, :host(fzn-new-layout) > div > .action-bar > .right > div.user {
  display: inline-block;
  position: relative;
  height: 100%;
  border-left: 1px solid rgba(0, 0, 0, 0.4);
  cursor: pointer;
  user-select: none;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login > div .avatar, :host(fzn-new-layout) > div > .action-bar > .right > div.user > div .avatar {
  float: left;
  display: flex;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.1875rem;
  align-items: center;
  justify-content: center;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login > div .avatar *, :host(fzn-new-layout) > div > .action-bar > .right > div.user > div .avatar * {
  cursor: pointer;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login > div .avatar img, :host(fzn-new-layout) > div > .action-bar > .right > div.user > div .avatar img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 0.1875rem;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login > div > .username, :host(fzn-new-layout) > div > .action-bar > .right > div.user > div > .username {
  float: left;
  line-height: 3rem;
  font-size: 0.875rem;
  color: #FFFFFF;
  font-weight: bold;
  padding-left: 0.75rem;
}
:host(fzn-new-layout) > div > .action-bar > .right > div.login > div > .username *, :host(fzn-new-layout) > div > .action-bar > .right > div.user > div > .username * {
  cursor: pointer;
}
:host(fzn-new-layout) > div > .content-frame {
  position: relative;
  top: 0;
  right: 0;
  bottom: auto;
  left: 0;
  padding-top: 3rem;
  min-height: 100%;
}
:host(fzn-new-layout) > div > .content-frame > div {
  position: relative;
  width: 100%;
}
:host(fzn-new-layout) > div > fzn-drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  height: 100%;
}
:host(fzn-new-layout) > div > fzn-drawer::part(slide) {
  padding-top: 3rem;
}
:host(fzn-new-layout) > div > fzn-drawer::part(inner) {
  border-top: 2px solid rgba(0, 0, 0, 0.2);
}
:host(fzn-new-layout) fzn-notices {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 300000;
  transform: translate(-50%, 0);
  max-width: 100%;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  padding: 0.4125rem;
}

:host(fzn-default-layout[collapsed]) > div > .app-badge > .branding > .title {
  display: none;
}
:host(fzn-default-layout[collapsed]) > div.drawer-open {
  overflow: hidden;
}
:host(fzn-default-layout[collapsed]) > div.drawer-open > .app-badge > .branding > .title {
  display: block;
}
:host(fzn-default-layout[collapsed]) > div > .app-badge > .branding {
  width: 100% !important;
}
:host(fzn-default-layout[collapsed]) > div fzn-drawer {
  box-shadow: 0 0 40px black;
}`;
//# sourceMappingURL=layout.lit.css.js.map