import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import {
  GraphQlHeader,
  useHeadersLocalStorage,
} from '../hooks/localStorageCache';

export function HeaderEditor({
  url,
  disabled = false,
}: {
  url: string;
  disabled?: boolean;
}) {
  const [headers, setHeaders] = useHeadersLocalStorage(url);
  const [tempHeaders, setTempHeaders] = useState<GraphQlHeader[] | undefined>();

  const currentHeaders = tempHeaders ?? headers ?? [{ name: '', value: '' }];

  const onChangeRow = useCallback(
    (index: number, name: string, value: string) => {
      const newHeaders = [...currentHeaders];
      newHeaders[index] = { name, value };
      setTempHeaders(newHeaders);
    },
    [currentHeaders],
  );
  const commit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (tempHeaders !== undefined) {
        setHeaders(tempHeaders);
        setTempHeaders(undefined);
      }
    },
    [setHeaders, tempHeaders],
  );

  return (
    <>
      <div>HTTP Headers</div>
      {currentHeaders && (
        <form onSubmit={commit}>
          <table>
            <tbody>
              {currentHeaders.map(({ name, value }, index) => (
                <EditHeaderRow
                  key={index}
                  index={index}
                  name={name}
                  value={value}
                  disabled={disabled}
                  commit={commit}
                  onChange={onChangeRow}
                />
              ))}
            </tbody>
          </table>
        </form>
      )}
    </>
  );
}

function EditHeaderRow({
  index,
  name,
  value,
  disabled,
  onChange,
  commit,
}: {
  index: number;
  disabled: boolean;
  name: string;
  value: string;
  onChange: (index: number, name: string, value: string) => void;
  commit: () => void;
}) {
  const changeHeaderName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange(index, event.currentTarget.value, value),
    [index, onChange, value],
  );
  const changeHeaderValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange(index, name, event.currentTarget.value),

    [index, name, onChange],
  );
  const onKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        commit();
      }
    },
    [commit],
  );

  return (
    <tr key={index}>
      <td>
        <input
          type="text"
          value={name}
          data-index={index}
          placeholder="Header name"
          onChange={changeHeaderName}
          onBlur={commit}
          onKeyUp={onKeyUp}
          disabled={disabled}
        />
      </td>
      <td>
        <input
          type="text"
          value={value}
          data-index={index}
          placeholder="value"
          onChange={changeHeaderValue}
          onBlur={commit}
          onKeyUp={onKeyUp}
          disabled={disabled}
        />
      </td>
    </tr>
  );
}
