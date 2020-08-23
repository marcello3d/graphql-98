import React from 'react';

import styles from './GraphQlTypeView.module.css';

const numberFormatter = new Intl.NumberFormat();
export function GraphQlValue({ value }: { value: any }) {
  if (value) {
  }
  if (value === true) {
    return <div className={styles.true}>true</div>;
  }
  if (value === false) {
    return <div className={styles.false}>false</div>;
  }
  if (value === null) {
    return <div className={styles.null}>NULL</div>;
  }
  if (value === undefined) {
    return <div className={styles.null}>NO VALUE</div>;
  }
  if (value === '') {
    return <div className={styles.empty}>EMPTY</div>;
  }
  if (typeof value === 'number') {
    return <div className={styles.number}>{numberFormatter.format(value)}</div>;
  }
  if (typeof value === 'string') {
    if (/^\s*(http|https):\/\//.test(value)) {
      return (
        <div className={styles.url}>
          <div className={styles.overflow}>
            <a href={value} rel="nofollow noreferrer noopener" target="_blank">
              {value}
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.text}>
        <div className={styles.overflow}>{value}</div>
      </div>
    );
  }

  if (React.isValidElement(value)) {
    return value;
  }

  let jsonValue;
  try {
    jsonValue = JSON.stringify(value);
  } catch (e) {
    return <div className={styles.json}>Cannot render</div>;
  }
  return (
    <div className={styles.json}>
      <div className={styles.overflow}>
        {jsonValue.replace(/([{,])"(.*?)":/g, '$1 $2: ')}
      </div>
    </div>
  );
}
