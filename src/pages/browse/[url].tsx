import { useRouter } from 'next/router';
import { GraphqlSchema } from '../../graphql-ui/schema';

export default function Home() {
  const router = useRouter();
  const { url } = router.query;
  if (typeof url !== 'string') {
    return <div>Invalid url: {url}</div>;
  }
  const actualUrl = url.replace(/_-/g, '/');
  return (
    <div>
      <h2>
        Schema for: <code>{actualUrl}</code>
      </h2>
      <GraphqlSchema url={actualUrl} />
    </div>
  );
}
