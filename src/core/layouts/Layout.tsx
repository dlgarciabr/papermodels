import Head from 'next/head';
import React from 'react';
import { BlitzLayout } from '@blitzjs/next';

const Layout: BlitzLayout<{
  title?: string;
  children?: React.ReactNode;
  authenticate?: boolean;
}> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || 'papermodels'}</title>
        <link rel='icon' href='/favicon.ico' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      {children}
    </>
  );
};

export default Layout;
