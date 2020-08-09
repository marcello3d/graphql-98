import { GraphqlSchema } from '../../graphql-ui/schema';
import Head from 'next/head';
import { useGraphql } from '../../lib/useGraphql';
import { ClientContext } from 'graphql-hooks';

export default function SchemaHome() {
  let result = useGraphql();
  if (!result) {
    return <div>…</div>;
  }
  const { client, url } = result;
  return (
    <div>
      <Head>
        <title>{url.replace(/^.*?:\/\//, '')} - GraphQL Browser</title>
      </Head>
      <h2>
        Schema for: <code>{url}</code>
      </h2>
      <ClientContext.Provider value={client}>
        <GraphqlSchema />
      </ClientContext.Provider>
    </div>
  );
}
