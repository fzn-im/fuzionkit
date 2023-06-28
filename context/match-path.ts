import { ReactiveElement } from 'lit';
import { ContextConsumer } from '@lit-labs/context';
import { decorateProperty } from '@lit/reactive-element/decorators/base.js';

import { currentPathContext } from '../router/context.js';

import { FieldMustMatchProvidedType } from './utils.js';
import { pathToRegexp } from 'path-to-regexp';

export function matchPath({
  path,
}: {
  path: string;
}): MatchPathDecorator {
  return decorateProperty({
    finisher: (ctor: typeof ReactiveElement, name: PropertyKey) => {
      ctor.addInitializer((element: ReactiveElement): void => {
        new ContextConsumer(
          element,
          {
            callback: (value: string): void => {
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
            },
            context: currentPathContext,
            subscribe: true,
          },
        );
      });
    },
  });
}

type MatchPathDecorator = {
  <K extends PropertyKey, Proto extends ReactiveElement>(
    protoOrDescriptor: Proto,
    name?: K
  ): FieldMustMatchProvidedType<Proto, K, { [key: string]: string } | null>;
};
