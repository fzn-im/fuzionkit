import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { consume } from '@lit/context';

import { shellContext, Shell } from '../shell/context.js';
import { FznDialog } from '../dialog/index.js';

import styles from './gallery-dialog.lit.css.js';

@customElement('fzn-gallery-dialog')
class GalleryDialog extends FznDialog {
  static styles = [
    ...FznDialog.styles,
    styles,
  ];

  @consume({ context: shellContext })
  shell: Shell;

  flexible = true;

  @property({ attribute: true, type: String, reflect: true })
  url: string;

  @state()
  loading = true;

  connectedCallback (): void {
    super.connectedCallback();
    const { shell } = this;

    shell?.lockScroll();
  }

  disconnectedCallback (): void {
    super.disconnectedCallback();
    const { shell } = this;

    shell?.unlockScroll();
  }

  handleMediaLoad = (): void => {
    this.loading = false;
  };

  render (): unknown {
    const { handleMediaLoad, loading, url } = this;

    return super.render(html`
      <div class="media">
        ${
          loading
            ? [
              html`
                <fa-icon class="spinner" type="fa-solid fa-cog fa-spin"></fa-icon>
              `,
            ]
            : null
        }

        <img
          @load=${handleMediaLoad}
          src=${url}
          style=${styleMap({
            display: loading ? 'none' : 'block',
          })}
        />

        <fzn-button
          class="open"
          href=${url}
          target="_blank"
          size="s"
          .variant=${'solid'}
        >
          Open
        </fzn-button>
      </div>
    `);
  }
}

export const createGalleryDialog = (
  {
    url,
  }: {
    url?: string,
  },
): GalleryDialog => {
  const dialog = Object.assign(
    new GalleryDialog(),
    { url },
  );

  const closeDialog = (): void => {
    dialog.remove();
  };

  dialog.addEventListener('close', closeDialog, { once: true });

  return dialog;
};
