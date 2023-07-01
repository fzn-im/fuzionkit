import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('fzn-nubblet')
export class Nubblet extends LitElement {
  static styles = [
    css`
      :host(:hover)
      {
        cursor: pointer;
        color: rgba(255, 255, 255, .5);
      }

      :host([active])
      {
        cursor: default;
        color: #CEE61B;
      }
    `,
  ];

  @property({ attribute: true, type: Boolean, reflect: true })
  active = false;

  @state()
  pressed = false;

  connectedCallback (): void {
    super.connectedCallback();
    const { handleMousedown, handleMouseup } = this;

    this.addEventListener('mousedown', handleMousedown);
    this.addEventListener('mouseup', handleMouseup);
  }

  disconnectedCallback (): void {
    super.disconnectedCallback();
    const { handleMousedown, handleMouseup } = this;

    this.removeEventListener('mousedown', handleMousedown);
    this.removeEventListener('mouseup', handleMouseup);
  }

  handleMousedown = (): void => {
    this.pressed = true;
  };

  handleMouseup = (): void => {
    this.pressed = false;
  };

  render (): unknown {
    const { active, pressed } = this;

    return html`
      <fa-icon
        type=${
          (pressed || active)
            ? 'fa-solid fa-circle'
            : 'fa-regular fa-circle'
        }
      ></fa-icon>
    `;
  }
}

interface GalleryItem {
  url: string;
}

@customElement('fzn-gallery-item')
class GalleryItem extends LitElement {
  static styles = [
    css`
      :host
      {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host img
      {
        position: absolute;
        max-width: 100%;
        max-height: 100%;
        box-shadow: 0 0 6px rgba(0, 0, 0, .3125);
      }
    `,
  ];

  @property({ attribute: false })
  item: GalleryItem;

  render (): unknown {
    const { url } = this.item;

    return html`
      <img src=${url} />
    `;
  }
}

@customElement('fzn-gallery')
export class Gallery extends LitElement {
  static styles = [
    css`
      :host
      {
        display: flex;
        flex-direction: column;
        gap: .5rem;
      }

      :host .stage
      {
        display: flex;
        background: rgba(255, 255, 255, .02);
        border-radius: 3px;
        aspect-ratio: 16 / 9;
        background-clip: border-box;
      }

      :host .stage fzn-gallery-item
      {
        flex-grow: 1;
      }

      :host .nubblets
      {
        display: flex;
        justify-content: center;
        gap: .5rem;
        font-size: .6125rem;
        color: rgba(255, 255, 255, .3);
      }
    `,
  ];

  @property({ attribute: false })
  items: GalleryItem[] = [];

  @state()
  selectedIndex = 0;

  render (): unknown {
    const { items, selectedIndex } = this;
    const selectedItem = items[selectedIndex];

    return html`
      <div class="stage">
        ${
          selectedItem
            ? html`
              <fzn-gallery-item
                .item=${selectedItem}
              ></fzn-gallery-item>`
            : null
        }
      </div>

      ${
        items.length ? html`
          <div class="nubblets">
            ${
              repeat(
                items,
                (): unknown => '',
                (_, idx): unknown => html`
                  <fzn-nubblet
                    ?active=${idx === selectedIndex}
                    @click=${(): void => { this.selectedIndex = idx; }}
                  ></fzn-nubblet>
                `,
              )
            }
          </div>
        ` : null
      }
    `;
  }
}

