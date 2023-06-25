import { Router } from './router.js';

export const handleRouteClick = (router?: Router) => (evt: MouseEvent): void => {
  evt.preventDefault();

  console.log('router', router);

  router?.navigate(
    (evt.composedPath().find(el => el instanceof HTMLAnchorElement) as HTMLAnchorElement).getAttribute('href'),
    {
      trigger: true,
    },
  );
};

export const handleHrefClick = (router?: Router) => (evt: MouseEvent, href?: string): void => {
  const { button } = evt;
  if (button && button === 1) {
    return;
  }

  evt.preventDefault();

  router?.navigate(
    href ?? (evt.currentTarget as HTMLElement).getAttribute('href'),
    {
      trigger: true,
    },
  );
};

/*
 * MIT License
 * 
 * Copyright (c) React Training LLC 2015-2019
 * Copyright (c) Remix Software Inc. 2020-2021 Copyright (c) Shopify Inc. 2022-2023
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export function compilePath(
  path: string,
  caseSensitive = false,
  end = true,
): [ RegExp, string[] ] {
  // warning(
  //   path === '*' || !path.endsWith('*') || path.endsWith('/*'),
  //   `Route path "${path}" will be treated as if it were ` +
  //     `"${path.replace(/\*$/, '/*')}" because the \`*\` character must ` +
  //     'always follow a `/` in the pattern. To get rid of this warning, ' +
  //     `please change the route path to "${path.replace(/\*$/, '/*')}".`
  // );

  const paramNames: string[] = [];
  let regexpSource =
    '^' +
    path
      .replace(/\/*\*?$/, '') // Ignore trailing / and /*, we'll handle it below
      .replace(/^\/*/, '/') // Make sure it has a leading /
      .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
      .replace(/\/:(\w+)/g, (_: string, paramName: string) => {
        paramNames.push(paramName);
        return '/([^\\/]+)';
      });

  if (path.endsWith('*')) {
    paramNames.push('*');
    regexpSource +=
      path === '*' || path === '/*'
        ? '(.*)$' // Already matched the initial /, just match the rest
        : '(?:\\/(.+)|\\/*)$'; // Don't include the / in params["*"]
  } else if (end) {
    // When matching to the end, ignore trailing slashes
    regexpSource += '\\/*$';
  } else if (path !== '' && path !== '/') {
    // If our path is non-empty and contains anything beyond an initial slash,
    // then we have _some_ form of path in our regex so we should expect to
    // match only if we find the end of this path segment.  Look for an optional
    // non-captured trailing slash (to match a portion of the URL) or the end
    // of the path (if we've matched to the end).  We used to do this with a
    // word boundary but that gives false positives on routes like
    // /user-preferences since `-` counts as a word boundary.
    regexpSource += '(?:(?=\\/|$))';
  } else {
    // Nothing to match for "" or "/"
  }

  const matcher = new RegExp(regexpSource, caseSensitive ? undefined : 'i');

  return [ matcher, paramNames ];
}
