import { stringify } from 'query-string';
import { Cache, CacheKeyObject } from 'graphql-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

function getSchemaStorageKey(url: string) {
  return `GraphQL98.schema.v2:${stringify({ url })}`;
}
export function getHeadersStorageKey(url: string) {
  return `GraphQL98.headers.v2:${stringify({ url })}`;
}

type CachedSchema = {
  fetchedAt: string;
  schema: any;
};
type CallbackData = { key: string; value: any };
const storageCallbacks = new Set<(info?: CallbackData) => void>();

function setLocalStorageData(key: string, value: any) {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const callbackData = { key, value };
  for (const callback of storageCallbacks) {
    callback(callbackData);
  }
}

export class LocalStorageCache implements Cache {
  key: string;
  memoryCache: any;
  constructor(url: string, private readonly introspectionQuery: string) {
    this.key = getSchemaStorageKey(url);
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
      setLocalStorageData(this.key, {
        fetchedAt: new Date().toISOString(),
        schema,
      });
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

export function useLocalStorage<T>(
  key: string | undefined,
): [T | undefined, (newValue: T) => void, () => void] {
  const [data, setData] = useState<T | undefined>();
  useEffect(() => {
    if (!key) {
      return undefined;
    }
    function setValue(value: string | null) {
      setData(value ? JSON.parse(value) : undefined);
    }

    const onStorage = (info?: CallbackData) => {
      if (info) {
        if (info.key === key) {
          setData(info.value);
        }
      } else {
        setValue(localStorage.getItem(key));
      }
    };
    onStorage();
    storageCallbacks.add(onStorage);
    return () => {
      storageCallbacks.delete(onStorage);
    };
  }, [key]);

  const updateData = useCallback(
    (newValue: T) => {
      if (!key) {
        return;
      }
      setData(newValue);
      setLocalStorageData(key, newValue);
    },
    [key],
  );

  const clearData = useCallback(() => {
    if (!key) {
      return;
    }
    setData(undefined);
    setLocalStorageData(key, undefined);
  }, [key]);

  return [data, updateData, clearData];
}

export function useSchemaFetchedAt(
  url: string | undefined | null,
): Date | undefined {
  const [cacheData] = useLocalStorage<CachedSchema>(
    url ? getSchemaStorageKey(url) : undefined,
  );

  return useMemo(
    () => (cacheData ? new Date(cacheData.fetchedAt) : undefined),
    [cacheData],
  );
}

export type GraphQlHeader = { name: string; value: string };

export function useHeadersLocalStorage(url: string) {
  return useLocalStorage<GraphQlHeader[]>(getHeadersStorageKey(url));
}
