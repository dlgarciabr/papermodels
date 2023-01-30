/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import Head from 'next/head';
import { ErrorComponent, Routes } from '@blitzjs/next';
import Link from 'next/link';

// ------------------------------------------------------
// This page is rendered if a route match is not found
// ------------------------------------------------------
export default function Page404() {
  const statusCode = 404;
  const title = 'This page could not be found';
  return (
    <>
      <Head>
        <title>
          {statusCode}: {title}
        </title>
      </Head>
      <ErrorComponent statusCode={statusCode} title={title} />
      <Link href={Routes.Home()}>Home</Link>
    </>
  );
}
