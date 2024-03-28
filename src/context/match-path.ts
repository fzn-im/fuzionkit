import { ReactiveElement } from 'lit';
import { ContextConsumer } from '@lit/context';

import { currentPathContext } from '../router/context.js';

import { FieldMustMatchProvidedType } from './utils.js';
import { pathToRegexp } from 'path-to-regexp';

export function matchPath({
  path,
}: {
  path: string;
}): MatchPathDecorator {
  return (<C extends ReactiveElement>(
    protoOrTarget: ClassAccessorDecoratorTarget<C, any>,
    nameOrContext: PropertyKey | ClassAccessorDecoratorContext<C, any>,
  ) => {
    function handle(element: ReactiveElement, name: string | symbol | PropertyKey, value: string): void {
      const paramList = [];
      const regex = pathToRegexp(path, paramList, { end: false });

      const matches = value.match(regex);

      if (!matches) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
        (element as any)[name] = null;

        return;
      }

      let params = {};

      matches.shift();

      params = Object.fromEntries(
        paramList
          .map(({ name }, idx) => [ name, matches[idx] ]),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
      (element as any)[name] = params;
    }

    if (typeof nameOrContext === 'object') {
      nameOrContext.addInitializer(function (this: ReactiveElement): void {
        new ContextConsumer(
          this,
          {
            callback: (value: string): void => {
              handle(this, nameOrContext.name, value);
            },
            context: currentPathContext,
            subscribe: true,
          },
        );
      });
    } else {
      (protoOrTarget.constructor as typeof ReactiveElement).addInitializer(
        (element: ReactiveElement): void => {
          new ContextConsumer(
            this,
            {
              callback: (value: string): void => {
                handle(element, nameOrContext, value);
              },
              context: currentPathContext,
              subscribe: true,
            },
          );
        },
      );
    }
  }) as MatchPathDecorator;
}

type MatchPathDecorator = {
  <K extends PropertyKey, Proto extends ReactiveElement>(
    protoOrDescriptor: Proto,
    name?: K
  ): FieldMustMatchProvidedType<Proto, K, { [key: string]: string } | null>;
};
