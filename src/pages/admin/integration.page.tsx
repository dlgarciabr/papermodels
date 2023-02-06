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
  const [loading, setLoading] = useState(false);

  const evaluate = async () => {
    setLoading(true);
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
      const parsedItems = JSON.parse(text);
      setItems(parsedItems);
      const demoItem = parsedItems[0];
      const parser = new DOMParser();
      const demoNode = parser.parseFromString(demoItem, 'text/html');
      const emptyNodes = Array.from(demoNode.querySelectorAll('*')).filter((node) => node.children.length === 0);
      console.log(emptyNodes[emptyNodes.length - 1]?.innerHTML);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const enqueue = async () => {
    setLoading(true);
    try {
      const antiCSRFToken = getAntiCSRFToken();
      await fetch(`${location.origin}/api/integration/enqueue`, {
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
    setLoading(false);
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
          <Button onClick={() => evaluate()} disabled={loading}>
            Evaluate
          </Button>
          <Button onClick={() => enqueue()} disabled={loading}>
            Enqueue
          </Button>
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
