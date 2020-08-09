import '../styles/globals.css';
import { GraphqlWrapper } from '../components/GraphqlWrapper';

function MyApp({ Component, pageProps }) {
  return (
    <GraphqlWrapper>
      <Component {...pageProps} />
    </GraphqlWrapper>
  );
}

export default MyApp;
