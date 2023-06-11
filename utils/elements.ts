import type { StyleInfo } from 'lit/directives/style-map.js';
import parseStyles from 'style-to-object';

interface TopLeftPosition {
  top: number;
  left: number;
}

interface HeightWidthSize {
  width: number;
  height: number;
}

export type MutableStyleInfo = {
  -readonly [K in keyof StyleInfo]: StyleInfo[K];
}

export const getElementOffsetPosition = (element: HTMLElement | SVGElement): TopLeftPosition => {
  const rect = element.getBoundingClientRect();

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

export const getViewportSize = (): HeightWidthSize => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
};

export const getElementOuterSize = (el: HTMLElement | SVGElement): HeightWidthSize => {
  if (el instanceof SVGElement) {
    return { width: el.clientWidth, height: el.clientHeight };
  } else {
    try {
      return { width: (el as HTMLElement).offsetWidth, height: (el as HTMLElement).offsetHeight };
    } catch (err) {
      console.error('Failed to get offsetWidth/offsetHeight: el =', el);
    }
  }
};

export const parseStyleInfo = (styles: string): StyleInfo => {
  return parseStyles(styles) as unknown as StyleInfo;
};
