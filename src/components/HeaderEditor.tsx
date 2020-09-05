import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { GraphQlHeader } from '../hooks/localStorageCache';

export function HeaderEditor({
  disabled = false,
  headers = [],
  onChange,
}: {
  disabled?: boolean;
  headers?: GraphQlHeader[];
  onChange: (headers: GraphQlHeader[]) => void;
}) {
  const currentHeaders = useMemo(
    () => [
      ...headers.filter(({ name, value }) => name || value),
      { name: '', value: '' },
    ],
    [headers],
  );

  const onChangeRow = useCallback(
    (index: number, name: string, value: string) => {
      const newHeaders = [...currentHeaders];
      newHeaders[index] = { name, value };
      onChange(newHeaders);
    },
    [currentHeaders, onChange],
  );

  return (
    <>
      <div>HTTP Headers (stored in browser local storage)</div>
      <table>
        <tbody>
          {currentHeaders.map(({ name, value }, index) => (
            <EditHeaderRow
              key={index}
              index={index}
              name={name}
              value={value}
              disabled={disabled}
              onChange={onChangeRow}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}

function EditHeaderRow({
  index,
  name,
  value,
  disabled,
  onChange,
}: {
  index: number;
  disabled: boolean;
  name: string;
  value: string;
  onChange: (index: number, name: string, value: string) => void;
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

  return (
    <tr key={index}>
      <td>
        <input
          type="text"
          value={name}
          data-index={index}
          placeholder="Header name"
          onChange={changeHeaderName}
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
          disabled={disabled}
        />
      </td>
    </tr>
  );
}
