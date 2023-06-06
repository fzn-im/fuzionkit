var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { consume } from '@lit-labs/context';
import { EnhancedEventTargetMixin } from '../utils/events.js';
import { shellContext } from '../shell/context.js';
import styles from './drawer.lit.css.js';
let Drawer = class Drawer extends EnhancedEventTargetMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.open = true;
        this.width = 240;
        this.showDrag = true;
        this.handleCloseClick = () => {
            this.dispatchEvent(new CustomEvent('close'));
        };
        this.handleDragStart = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            const { handleDragMove, shell } = this;
            this.dispatchEvent(new CustomEvent('drag-change', { detail: true }));
            shell?.lockMouseGuard();
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', () => {
                window.removeEventListener('mousemove', handleDragMove);
                this.dispatchEvent(new CustomEvent('drag-change', { detail: false }));
                shell?.unlockMouseGuard();
            }, { once: true });
        };
        this.handleDragMove = ({ pageX }) => {
            this.dispatchEvent(new CustomEvent('resize', { detail: { width: pageX } }));
        };
    }
    static { this.styles = [styles]; }
    render() {
        const { handleCloseClick, handleDragStart, open, showDrag, width } = this;
        const adjustedWidth = open ? width : 0;
        return html `
      <div>
        <div
          class=${classMap({
            open,
            'slide-outer': true,
        })}
          style=${styleMap({ width: `${adjustedWidth}px` })}
        >
          <div class="slide" part="slide">
            <div class="inner" part="inner">
              <div class="content">
                <slot></slot>
              </div>
            </div>

            ${showDrag
            ? html `
                  <div class="drag" @mousedown=${handleDragStart}>
                    <div></div>
                  </div>
                `
            : null}
          </div>
        </div>
        <div class="blackout" @click=${handleCloseClick}></div>
      </div>
    `;
    }
};
__decorate([
    consume({ context: shellContext })
], Drawer.prototype, "shell", void 0);
__decorate([
    query('.content')
], Drawer.prototype, "content", void 0);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Drawer.prototype, "open", void 0);
__decorate([
    property({ attribute: true, type: Number, reflect: true })
], Drawer.prototype, "width", void 0);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Drawer.prototype, "showDrag", void 0);
Drawer = __decorate([
    customElement('fzn-drawer')
], Drawer);
export default Drawer;
//# sourceMappingURL=drawer.js.map