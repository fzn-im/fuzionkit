import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
// import { contextProvided } from '@lit-labs/context';

import { EnhancedEventTargetMixin } from '../utils/events.js';
// import { defaultLayoutContext } from 'js/components/layouts/default/context';
// import DefaultLayout from 'js/components/layouts/default/default-layout';

import styles from './drawer.lit.css';

export type DrawerResizeEvent = {
  width: number;
}

@customElement('fzn-drawer')
export default class Drawer extends EnhancedEventTargetMixin<typeof LitElement, Drawer>(LitElement) {
  static styles = [ styles ];

  // @contextProvided({ context: defaultLayoutContext })
  // layout: DefaultLayout | null;

  @query('.content')
  content: HTMLElement;

  @property({ attribute: true, type: Boolean, reflect: true })
  open = true;

  @property({ attribute: true, type: Number, reflect: true })
  width = 240;

  @property({ attribute: true, type: Boolean, reflect: true })
  showDrag = true;

  handleCloseClick = (): void => {
    this.dispatchEvent(new CustomEvent('close'));
  };

  handleDragStart = (evt: MouseEvent): void => {
    evt.preventDefault();
    evt.stopPropagation();
    const { handleDragMove } = this;

    this.dispatchEvent(new CustomEvent<boolean>('drag-change', { detail: true }));
    // layout?.lockMouseGuard();

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', handleDragMove);

      this.dispatchEvent(new CustomEvent<boolean>('drag-change', { detail: false }));
      // layout?.unlockMouseGuard();
    }, { once: true });
  };

  handleDragMove = ({ pageX }: MouseEvent): void => {
    this.dispatchEvent(new CustomEvent<DrawerResizeEvent>('resize', { detail: { width: pageX } }));
  };

  render (): unknown {
    const { handleCloseClick, handleDragStart, open, showDrag, width } = this;

    const adjustedWidth = open ? width : 0;

    return html`
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

            ${
              showDrag
                ? html`
                  <div class="drag" @mousedown=${handleDragStart}>
                    <div></div>
                  </div>
                `
                : null
            }
          </div>
        </div>
        <div class="blackout" @click=${handleCloseClick}></div>
      </div>
    `;
  }
}
