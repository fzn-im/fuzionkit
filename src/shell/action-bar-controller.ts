import { ReactiveController, ReactiveControllerHost } from 'lit';

import { type Shell } from './shell.js';

export type ActionBarControllerHost = ReactiveControllerHost & {
  isConnected: boolean;
  shell?: Shell;
};

export class ActionBarController implements ReactiveController {
  private host: ActionBarControllerHost;

  constructor(host: ActionBarControllerHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostDisconnected(): void {}

  render(content: unknown = null): void {
    const { host } = this;

    if (!host.isConnected || !host.shell) {
      return;
    }

    host.shell.renderActionBar(content);
  }
}
