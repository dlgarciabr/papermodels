import { getAntiCSRFToken } from '@blitzjs/auth';
import { Button, Container, createTheme, TextField, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import Layout from 'src/core/layouts/Layout';
import { getSimpleRandomKey } from 'src/utils/global';

const Integration = () => {
  const [url, setUrl] = useState('https://papermau.blogspot.com/');
  const [querySelector, setQuerySelector] = useState('div>b>a');
  // const [param, setParam] = useState('href')
  const [items, setItems] = useState<any[]>([]);

  const evaluate = async () => {
    try {
      const antiCSRFToken = getAntiCSRFToken();
      const response = await fetch(`${location.origin}/api/integration/evaluateSetup`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        },
        body: JSON.stringify({ url, querySelector })
      });
      const text = await response.text();
      setItems(JSON.parse(text));
    } catch (error) {
      console.log(error);
    }
  };

  const aaa = async () => {
    try {
      const antiCSRFToken = getAntiCSRFToken();
      await fetch(`${location.origin}/api/integration/aaa`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        },
        body: JSON.stringify({ url, querySelector })
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout title='Home'>
      <Head>
        <title>Papermodels</title>
      </Head>
      <ThemeProvider theme={createTheme()}>
        <Container component='main'>
          Setup
          <TextField label='Url' value={url} onChange={(e) => setUrl(e.target.value)} />
          <TextField label='Selector' value={querySelector} onChange={(e) => setQuerySelector(e.target.value)} />
          {/* <TextField label='Param' value={param} onChange={(e) => setParam(e.target.value)} /> */}
          <Button onClick={() => evaluate()}>Evaluate</Button>
          <Button onClick={() => aaa()}>AAAA</Button>
          <ul>
            {items.map((item) => (
              <li key={getSimpleRandomKey()}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Integration;
