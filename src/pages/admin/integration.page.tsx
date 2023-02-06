import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke } from '@blitzjs/rpc';
import { Button, Container, createTheme, TextField, ThemeProvider } from '@mui/material';
import { IntegrationSetup } from '@prisma/client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from 'src/core/layouts/Layout';
import getIntegrationSetups from 'src/integration-setups/queries/getIntegrationSetups';
import { getSimpleRandomKey } from 'src/utils/global';

const Integration = () => {
  // const [url, setUrl] = useState('https://papermau.blogspot.com/');
  // const [querySelector, setQuerySelector] = useState('div>b>a');
  // const [param, setParam] = useState('href')
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<IntegrationSetup>({
    id: 0,
    domain: '',
    selector: '',
    name: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [integrationSetups, setIntegrationSetups] = useState<IntegrationSetup[]>([]);

  const loadSetups = async () => {
    const { integrationSetups } = await invoke(getIntegrationSetups, {
      orderBy: { name: 'asc' }
    });
    setIntegrationSetups(integrationSetups);
  };

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
        body: JSON.stringify({ url: selectedSetup.domain, querySelector: selectedSetup.selector })
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
        body: JSON.stringify({ url: selectedSetup.domain, querySelector: selectedSetup.selector })
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleSelectSetup = (id: number) => {
    const selectedSetup = integrationSetups.find((setup) => setup.id === id);
    console.log(integrationSetups);
    setSelectedSetup(selectedSetup!);
  };

  useEffect(() => {
    void loadSetups();
  }, []);

  return (
    <Layout title='Home'>
      <Head>
        <title>Papermodels</title>
      </Head>
      <ThemeProvider theme={createTheme()}>
        <Container component='main'>
          Setup
          <select onChange={(e) => handleSelectSetup(Number(e.target.value))}>
            <option value={-1}>Setups...</option>
            {integrationSetups.map((item) => (
              <option key={Math.random().toString(36).substring(2, 15)} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <TextField label='Url' value={selectedSetup.domain} disabled />
          <TextField label='Selector' value={selectedSetup.selector} disabled />
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
