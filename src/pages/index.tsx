import styles from '../styles/Home.module.css';
import Head from 'next/head';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { IntrospectionType } from 'graphql';
import { useRouter } from 'next/router';

export default function Home() {
  const [url, setUrl] = useState('');
  const onChangeUrl = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setUrl(event.currentTarget.value),
    [],
  );
  const router = useRouter();

  const loadUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const strippedUrl = url.replace(/\//g, '_-');
      router.push(`/browse/${strippedUrl}`);
    },
    [router, url],
  );
  return (
    <div className={styles.container}>
      <Head>
        <title>GraphQL Browser</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>GraphQL Browser</h1>
        <form onSubmit={loadUrl}>
          <label>
            Url:{' '}
            <input
              type="text"
              placeholder="GraphQL endpoint"
              value={url}
              onChange={onChangeUrl}
            />
          </label>
          <button>Go ➡</button>
        </form>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/marcello3d/firebase-auth-nextjs">
          Source on Github
        </a>
      </footer>
    </div>
  );
}
