export function getSelfHttpBase(): string {
  return window.location.protocol + '//' +
    window.location.hostname + ':' + window.location.port;
}

export function getSelfWsBase(): string {
  return (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' +
    window.location.hostname + ':' + window.location.port;
}
