import { stringify } from 'query-string';
import { Cache, CacheKeyObject } from 'graphql-hooks';
import { useEffect, useState } from 'react';

function getLocalStorageKey(url: string) {
  return `GraphQL98.schema.v2:${stringify({ url })}`;
}

const storageCallbacks = new Set<() => void>();

export class LocalStorageCache implements Cache {
  key: string;
  memoryCache: any;
  constructor(url: string, private readonly introspectionQuery: string) {
    this.key = getLocalStorageKey(url);
  }
  get(keyObject: CacheKeyObject): object {
    if (keyObject.operation.query === this.introspectionQuery) {
      if (this.memoryCache) {
        return this.memoryCache;
      }
      const value = localStorage.getItem(this.key);
      if (value) {
        const json = JSON.parse(value);
        const schema = json?.schema;
        if (schema !== undefined) {
          console.log(`Loading cached schema from ${json?.fetchedAt}`);
          this.memoryCache = schema;
          return schema;
        }
      }
    }
    // Cache is typed graphql-hooks incorrectly
    return (null as unknown) as object;
  }
  set(keyObject: CacheKeyObject, schema: any): void {
    if (
      keyObject.operation.query === this.introspectionQuery &&
      !schema.error
    ) {
      if (this.memoryCache?.data === schema.data) {
        return;
      }
      console.log('Caching schema');
      this.memoryCache = schema;
      localStorage.setItem(
        this.key,
        JSON.stringify({
          fetchedAt: new Date().toISOString(),
          schema,
        }),
      );
      for (const callback of storageCallbacks) {
        callback();
      }
    }
  }
  delete(keyObject: CacheKeyObject): void {
    if (keyObject.operation.query === this.introspectionQuery) {
      localStorage.removeItem(this.key);
    }
  }
  clear(): void {
    localStorage.removeItem(this.key);
  }
  keys() {
    return [];
  }
  getInitialState() {
    return {};
  }
}

export function useSchemaFetchedAt(
  url: string | undefined | null,
): Date | undefined {
  const [cacheDate, setCacheDate] = useState<Date | undefined>();
  useEffect(() => {
    if (!url) {
      return undefined;
    }
    function setValue(value: string | null) {
      const fetchedAt = value ? JSON.parse(value)?.fetchedAt : undefined;
      setCacheDate(fetchedAt ? new Date(fetchedAt) : undefined);
    }

    const onStorage = () => {
      setValue(localStorage.getItem(getLocalStorageKey(url)));
    };
    onStorage();
    storageCallbacks.add(onStorage);
    return () => {
      storageCallbacks.delete(onStorage);
    };
  }, [url]);
  return cacheDate;
}
