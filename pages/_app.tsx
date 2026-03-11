import type { AppProps } from 'next/app';
import { ProProvider } from '../lib/ProContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ProProvider>
      <Component {...pageProps} />
    </ProProvider>
  );
}
