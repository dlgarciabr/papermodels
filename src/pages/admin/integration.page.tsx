import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke } from '@blitzjs/rpc';
import { Button, Container, createTheme, TextField, ThemeProvider } from '@mui/material';
import { IntegrationSetup } from '@prisma/client';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import Layout from 'src/core/layouts/Layout';
import getIntegrationSetups from 'src/integration-setups/queries/getIntegrationSetups';
import { getSimpleRandomKey } from 'src/utils/global';

const Integration = () => {
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
  const [message, setMessage] = useState<string>('');

  const loadSetups = async () => {
    const { integrationSetups } = await invoke(getIntegrationSetups, {
      orderBy: { name: 'asc' }
    });
    setIntegrationSetups(integrationSetups);
  };

  const evaluate = async () => {
    setItems([]);
    setMessage('');
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
      const json = JSON.parse(text);
      if (json.error) {
        setMessage(json.error);
      } else {
        setItems(json);
      }
    } catch (error) {
      console.log(error);
      setMessage(error);
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
    setSelectedSetup(selectedSetup!);
  };

  const setParam = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedSetup({
      ...selectedSetup,
      [e.target.name]: e.target.value
    });
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
          <TextField label='Domain' value={selectedSetup.domain} name='domain' onChange={(e) => setParam(e as any)} />
          <TextField
            label='Selector'
            value={selectedSetup.selector}
            name='selector'
            onChange={(e) => setParam(e as any)}
          />
          <Button onClick={() => evaluate()} disabled={loading}>
            Evaluate
          </Button>
          <Button onClick={() => enqueue()} disabled={loading}>
            Enqueue
          </Button>
          {loading && <p>please wait...</p>}
          {items.length > 0 && (
            <ul>
              {items.map((item) => (
                <li key={getSimpleRandomKey()}>{JSON.stringify(item)}</li>
              ))}
            </ul>
          )}
          {!loading && items.length === 0 && !message && <p>No items found</p>}
          {<p style={{ color: 'red' }}>{message}</p>}
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Integration;
