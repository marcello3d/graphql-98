import { stringify } from 'query-string';

export function getGraphQlBrowserUrl(endpointUrl: string, path?: string) {
  return `${location.pathname}?${stringify({ url: endpointUrl, path })}`;
}
