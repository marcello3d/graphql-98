export function decodeUrlForPath(url: any) {
  if (typeof url !== 'string') {
    return undefined;
  }
  let actualUrl = url.replace(/_-/g, '/');
  if (!/^http:/.test(actualUrl)) {
    actualUrl = 'https://' + actualUrl;
  }
  return actualUrl;
}

export function encodeUrlForPath(url: string) {
  return url.replace(/^https:\/\//, '').replace(/\//g, '_-');
}
