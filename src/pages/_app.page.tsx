/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import { ErrorFallbackProps, ErrorComponent, ErrorBoundary, AppProps } from '@blitzjs/next';
import { AuthenticationError, AuthorizationError } from 'blitz';
import React from 'react';
import { withBlitz } from 'src/blitz-client';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const RootErrorFallback = ({ error }: ErrorFallbackProps) => {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>;
  } else if (error instanceof AuthorizationError) {
    return <ErrorComponent statusCode={error.statusCode} title='Sorry, you are not authorized to access this' />;
  } else {
    return <ErrorComponent statusCode={(error as any)?.statusCode || 400} title={error.message || error.name} />;
  }
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>{getLayout(<Component {...pageProps} />)}</ErrorBoundary>
      <ToastContainer />
    </>
  );
};

export default withBlitz(MyApp);
