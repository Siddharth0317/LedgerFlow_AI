import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body className="bg-[#090D16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
