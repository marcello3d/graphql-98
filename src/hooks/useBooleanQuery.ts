import { BooleanParam, useQueryParam } from 'use-query-params';
import { ChangeEvent, useCallback } from 'react';

export function useBooleanQuery(
  name: string,
): [boolean, (eventOrValue: boolean | ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useQueryParam(name, BooleanParam);
  const setValueOrUndefined = useCallback(
    (value: boolean | ChangeEvent<HTMLInputElement>) => {
      if (typeof value !== 'boolean') {
        value = value.currentTarget.checked;
      }
      setValue(value ? true : undefined, 'replaceIn');
    },
    [setValue],
  );
  return [!!value, setValueOrUndefined];
}
