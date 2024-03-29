import i18next from 'i18next';

export type ErrorMap = {
  [key: string]: [ string, ...any ][];
};

export type ErrorMapFormatted = {
  [key: string]: string[];
};

export class ErrorMapError extends Error {
  errorMap: ErrorMap;

  constructor(message: string, errorMap: ErrorMap) {
    super(message);
    this.name = 'ErrorMapError';
    this.errorMap = errorMap;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  formatted(): ErrorMapFormatted {
    const { errorMap } = this;

    return Object.fromEntries(
      Object.entries(errorMap).map(([ key, value ]) => (
        [
          key,
          value.map(([ type, ...args ]) => i18next.t(`error.${type}`, ...args)),
        ]
      )),
    );
  }
}
