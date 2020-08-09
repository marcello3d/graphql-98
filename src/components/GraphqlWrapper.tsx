import Head from 'next/head';
import { useRouter } from 'next/router';
import { ClientContext } from 'graphql-hooks';

import styles from '../styles/Home.module.css';

import { useGraphql } from '../lib/useGraphql';

export function GraphqlWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { query } = router;
  const result = useGraphql(query.url);
  if (!result) {
    return <div>JavaScript required</div>;
  }
  const { client, url } = result;
  return (
    <div className={styles.container}>
      <Head>
        <title>{url.replace(/^.*?:\/\//, '')} - GraphQL Browser</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          GraphQL Browser: <code>{url}</code>
        </h1>
        <p className={styles.description}></p>
        <ClientContext.Provider value={client}>
          {children}
        </ClientContext.Provider>
      </main>
    </div>
  );
}
