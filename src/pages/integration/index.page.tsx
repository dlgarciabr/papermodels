import { Container, createTheme, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import Layout from 'src/core/layouts/Layout';

const Integration = () => {
  const items = [];

  return (
    <Layout title='Home'>
      <Head>
        <title>Papermodels</title>
      </Head>
      <ThemeProvider theme={createTheme()}>
        <Container component='main'>
          items parsed
          {items}
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Integration;
