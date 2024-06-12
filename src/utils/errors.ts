import i18next from 'i18next';

export type ErrorMap = {
  [key: string]: [ string, ...any ][];
};

export type ErrorMapFormatted = {
  [key: string]: string[];
};

export class ErrorMapError extends Error {
  error: string;
  errorMap: ErrorMap;

  constructor(message: string, errorMap: ErrorMap) {
    super(i18next.t(`error.${message}`));
    this.name = 'ErrorMapError';
    this.error = message;
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

export class LocalizedError extends Error {
  error: string;

  constructor(message: string) {
    super(i18next.t(`error.${message}`));
    this.name = 'LocalizedError';
    this.error = message;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
