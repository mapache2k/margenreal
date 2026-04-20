// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import posthog from "posthog-js";
import "../styles/globals.css";
import { ProProvider } from "../lib/ProContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    posthog.init("phc_zKFtMZZ5kPqpT2RRFSCWL3ao3dfWiREGdDFrqe2vD8GM", {
      api_host: "https://us.i.posthog.com",
      capture_pageview: false,
    });

    const handleRouteChange = () => posthog.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
    <ProProvider>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <Component {...pageProps} />
    </ProProvider>
  );
}
