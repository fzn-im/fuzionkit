import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ChangeEvent, EnhancedEventTargetMixin } from '../utils/events.js';
import { ControllableMixin } from '../base/controllable-mixin.js';

import '../inputs/checkbox/checkbox.js';
import '../inputs/form-group/index.js';
import '../inputs/textfield/index.js';

import styles from './login.lit.css.js';

export type LoginValue = {
  username: string;
  password: string;
  remember: boolean;
}

@customElement('fzn-login')
export class Login extends ControllableMixin<
  LoginValue,
  typeof LitElement
>(
  EnhancedEventTargetMixin<
    typeof LitElement,
    Login
  >(LitElement),
  {
    defaultValue: {
      username: '',
      password: '',
      remember: true,
    },
  },
) {
  static styles = [ styles ];

  @state()
  showPasscode = false;

  @property({ attribute: true, type: Boolean })
  submitting = false;

  @property({ attribute: true, type: String })
  error?: string;

  async submit(): Promise<void> {
    const { value } = this;

    this.dispatchEvent(new CustomEvent(
      'submit',
      { detail: value },
    ));
  }

  handleInputChange = (
    evt: CustomEvent<ChangeEvent<unknown>> & { currentTarget: HTMLElement },
  ): void => {
    evt.stopPropagation();
    const { currentTarget, detail: { value } } = evt;

    this.internalValue = {
      ...this.value,
      [currentTarget.getAttribute('name')]: value,
    };
  };

  handleForgotPasswordClick = (): void => {
    this.dispatchEvent(new CustomEvent('forgot-password'));
  };

  handleLoginClick = async (): Promise<void> => {
    await this.submit();
  };

  handleKeyUp = ({ key }: KeyboardEvent): void => {
    if (key === 'Enter') {
      this.submit();
    }
  };

  render(): unknown {
    const {
      error,
      handleForgotPasswordClick,
      handleLoginClick,
      handleKeyUp,
      handleInputChange,
      showPasscode,
      submitting,
      value,
    } = this;
    const {
      password,
      remember,
      username,
    } = value;

    return [
      html`
        <fzn-panel-body>
          <fzn-form-group
            label="Username"
          >
            <fzn-textfield
              name="username"
              @change=${handleInputChange}
              @keyup=${handleKeyUp}
              ?disabled=${submitting}
              .value=${username}
            ></fzn-textfield>
          </fzn-form-group>

          <fzn-form-group
            label="Password"
          >
            <fzn-textfield
              name="password"
              @change=${handleInputChange}
              @keyup=${handleKeyUp}
              ?disabled=${submitting}
              .value=${password}
              type="password"
            ></fzn-textfield>
          </fzn-form-group>

          <fzn-checkbox-row
            name="remember"
            @change=${handleInputChange}
            ?disabled=${submitting}
            .value=${remember}
          >
            Remember me
          </fzn-checkbox-row>

          ${
            error
              ? html`
                <fzn-alert>
                  ${error}
                </fzn-alert>
              `
              : null
          }
        </fzn-panel-body>
      `,
      html`
        <fzn-panel-footer>
          ${
            !submitting
              ? html`
                <div slot="left">
                  <fzn-button
                    @click=${handleForgotPasswordClick}
                    size="s"
                  >
                    Forgot Password
                  </fzn-button>
                </div>
              `
              : null
          }

          ${
            !submitting && showPasscode
              ? html`
                <fzn-button
                  @click=${handleForgotPasswordClick}
                  size="s"
                >
                  Guest
                </fzn-button>
              `
              : null
          }

          <fzn-button
            @click=${handleLoginClick}
            ?disabled=${submitting}
            size="s"
            .variant=${'success'}
          >
            ${
              !submitting
                ? 'Login'
                : html`<fa-icon type="fa fa-cog fa-spin"></fa-icon>`
            }
          </fzn-button>
        </fzn-panel-footer>
      `,
    ];
  }
}
