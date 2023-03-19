/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import { ErrorFallbackProps, ErrorComponent, ErrorBoundary, AppProps } from '@blitzjs/next';
import { AuthenticationError, AuthorizationError } from 'blitz';
import React from 'react';
import { withBlitz } from 'src/blitz-client';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles.scss';

const RootErrorFallback = ({ error }: ErrorFallbackProps) => {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>;
  } else if (error instanceof AuthorizationError) {
    return <ErrorComponent statusCode={error.statusCode} title='Sorry, you are not authorized to access this' />;
  } else {
    return <ErrorComponent statusCode={(error as any)?.statusCode || 400} title={error.message || error.name} />;
  }
};

let timeout: NodeJS.Timeout | undefined;

const runIntegration = async () => {
  if (typeof location !== 'undefined') {
    try {
      await fetch(`${location.origin}/api/integration`);
    } finally {
      if (!timeout) {
        timeout = setTimeout(() => {
          void runIntegration();
          clearTimeout(timeout);
          timeout = undefined;
        }, 50000);
      }
    }
  }
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const getLayout = Component.getLayout || ((page) => page);
  if (process.env.NODE_ENV === 'development') {
    void runIntegration();
  }
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined
      }}>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>{getLayout(<Component {...pageProps} />)}</ErrorBoundary>
      <ToastContainer />
    </GoogleReCaptchaProvider>
  );
};

export default withBlitz(MyApp);
