import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ChangeEvent, EnhancedEventTargetMixin } from '../utils/events.js';
import { ControllableMixin } from '../base/controllable-mixin.js';

import 'fuzionkit/inputs/checkbox';

import styles from '../login/login.lit.css.js';

export type RegisterValue = {
  agree: boolean;
  username: string;
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
}

@customElement('fzn-register')
export class Register extends ControllableMixin<
  RegisterValue,
  typeof LitElement
>(
  EnhancedEventTargetMixin<
    typeof LitElement,
    Register
  >(LitElement),
  {
    defaultValue: {
      agree: false,
      username: '',
      email: '',
      emailConfirm: '',
      password: '',
      passwordConfirm: '',
    },
  },
) {
  static styles = [ styles ];

  @state()
  submitting = false;

  @state()
  errorMap?: { [key: string]: string[] };

  @property({ attribute: true, type: Boolean, reflect: true })
  registered = false;

  async submit (): Promise<void> {
    const { value: detail } = this;

    this.dispatchEvent(new CustomEvent(
      'submit',
      { detail },
    ));
  }

  handleInputChange = (
    {
      currentTarget,
      detail: { value },
    }: CustomEvent<ChangeEvent<unknown>> & { currentTarget: HTMLElement },
  ): void => {
    this.internalValue = {
      ...this.value,
      [currentTarget.getAttribute('name')]: value,
    };
  };

  handleRegisterClick = async (): Promise<void> => {
    await this.submit();
  };

  handleKeyUp = ({ key }: KeyboardEvent): void => {
    if (key === 'Enter') {
      this.submit();
    }
  };

  render (): unknown {
    const {
      errorMap,
      handleInputChange,
      handleRegisterClick,
      registered,
      submitting,
    } = this;
    const { agree } = this.value;

    return [
      !registered
        ? html`
          <fzn-panel-body>
            <fzn-form-group
              label="Username"
              .helperText=${errorMap && errorMap.username}
            >
              <fzn-textfield
                ?disabled=${submitting}
                name="username"
                @change=${handleInputChange}
              ></fzn-textfield>
            </fzn-form-group>

            <fzn-form-group
              label="Password"
              .helperText=${errorMap && errorMap.password}
            >
              <fzn-textfield
                autoComplete="new-password"
                ?disabled=${submitting}
                name="password"
                @change=${handleInputChange}
                type="password"
              ></fzn-textfield>
            </fzn-form-group>

            <fzn-form-group
              label="Confirm Password"
              .helperText=${errorMap && errorMap.confirmPassword}
            >
              <fzn-textfield
                autoComplete="new-password"
                ?disabled=${submitting}
                name="passwordConfirm"
                @change=${handleInputChange}
                type="password"
              ></fzn-textfield>
            </fzn-form-group>

            <fzn-form-group
              label="Email"
              .helperText=${errorMap && errorMap.email}
            >
              <fzn-textfield
                ?disabled=${submitting}
                name="email"
                @change=${handleInputChange}
              ></fzn-textfield>
            </fzn-form-group>

            <fzn-form-group
              label="Confirm Email"
              .helperText=${errorMap && errorMap.confirmEmail}
            >
              <fzn-textfield
                ?disabled=${submitting}
                name="emailConfirm"
                @change=${handleInputChange}
              ></fzn-textfield>
            </fzn-form-group>

            <fzn-checkbox-row
              ?disabled=${submitting}
              name="agree"
              @change=${handleInputChange}
            >
              I agree to the terms of service.
            </fzn-checkbox-row>

            ${
              errorMap
                ? html`
                  <fzn-alert></fzn-alert>
                `
                : null
            }
          </fzn-panel-body>
        `
        : null,
      registered
        ? html`
          <fzn-panel-body>
            <fzn-alert .variant=${'success'}>
              Successfully registered.
            </fzn-alert>
          </fzn-panel-body>
        `
        : null,
      !registered
        ? html`
          <fzn-panel-footer>
            <fzn-button
              @click=${handleRegisterClick}
              ?disabled=${!agree}
              size="s"
            >
              ${
                !submitting
                  ? 'Register'
                  : html`<fa-icon type="fa fa-cog fa-spin"></fa-icon>`
              }
            </fzn-button>
          </fzn-panel-footer>
        `
        : null,
    ];
  }
}
