/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import Document, { Html, Main, NextScript, Head } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }
  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta name='description' content='Papermodels paper craft models and toys for playing and hobby' />
          {process.env.NODE_ENV != 'development' && (
            <>
              <Script src='https://www.googletagmanager.com/gtag/js?id=G-B8W9NCLDY8' strategy='afterInteractive' />
              <Script id='google-analytics' strategy='afterInteractive'>
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
    
                gtag('config', 'G-B8W9NCLDY8');
                `}
              </Script>
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
