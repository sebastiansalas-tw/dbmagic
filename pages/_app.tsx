import type { AppProps } from 'next/app';
import "../src/assets/init.css";
 
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}