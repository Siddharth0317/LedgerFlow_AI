import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication on app mount
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Head>
        <title>Agentflow_AI — Autonomous Invoice & Expense Operations Hub</title>
        <meta
          name="description"
          content="AI-powered operations platform for automated invoice parsing, validation, and multi-agent workflow orchestration."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
