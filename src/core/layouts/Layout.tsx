import Head from "next/head";
import React, { FC } from "react";
import { BlitzLayout } from "@blitzjs/next";

const Layout: BlitzLayout<{
  title?: string;
  children?: React.ReactNode;
  authenticate?: boolean;
}> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "papermodels"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </>
  );
};

export default Layout;
