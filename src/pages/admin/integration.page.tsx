import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke } from '@blitzjs/rpc';
import { Button, Container, Grid, TextField } from '@mui/material';
import { IntegrationSetup } from '@prisma/client';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import getIntegrationSetups from 'src/integration-setups/queries/getIntegrationSetups';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const Integration = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<IntegrationSetup>({
    id: 0,
    name: '',
    domain: '',
    itemUrlSelector: '',
    previewImagesSelector: '',
    categorySelector: '',
    ignoreExpressions: '',
    categoryBinding: '',
    descriptionSelector: null,
    schemesSelector: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [integrationSetups, setIntegrationSetups] = useState<IntegrationSetup[]>([]);
  const [message, setMessage] = useState<string>('');
  const [fileIntegrationJob, setFileIntegrationJob] = useState<NodeJS.Timeout>();

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
        body: JSON.stringify({ url: selectedSetup.domain, querySelector: selectedSetup.itemUrlSelector })
      });
      const text = await response.text();
      const json = JSON.parse(text);
      if (json.error) {
        setMessage(json.error);
      } else {
        setItems(json);
      }
    } catch (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  const enqueue = async () => {
    setMessage('');
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
        body: JSON.stringify({
          url: selectedSetup.domain,
          querySelector: selectedSetup.itemUrlSelector,
          setupId: selectedSetup.id,
          categorySelector: selectedSetup.categorySelector,
          categoryBinding: JSON.parse(selectedSetup.categoryBinding)
        })
      });
    } catch (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  const runItemsIntegration = async () => {
    try {
      const antiCSRFToken = getAntiCSRFToken();
      const response = await fetch(`${location.origin}/api/integration`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        }
      });
      console.log('runItemsIntegration', response);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const runFilesIntegration = async () => {
    try {
      const antiCSRFToken = getAntiCSRFToken();
      await fetch(`${location.origin}/api/integration/files`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        }
      });
      if (!fileIntegrationJob) {
        setFileIntegrationJob(setTimeout(() => runFilesIntegration(), 60000));
      }
    } catch (error) {
      setMessage(error.message);
    }
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

  const columns: GridColDef[] = [{ field: 'id', headerName: 'Url', width: 1000 }];

  const rows = items.map((item) => ({ id: item }));

  return (
    <>
      <Head>
        <title>Papermodels</title>
      </Head>
      <Container component='main'>
        <Grid container>
          <Grid item xs={12}>
            Setup
            <select onChange={(e) => handleSelectSetup(Number(e.target.value))}>
              <option value={-1}>Setups...</option>
              {integrationSetups.map((item) => (
                <option key={Math.random().toString(36).substring(2, 15)} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Domain'
              value={selectedSetup.domain}
              name='domain'
              onChange={(e) => setParam(e as any)}
            />
            <TextField
              label='Item url selector'
              value={selectedSetup.itemUrlSelector}
              name='itemUrlSelector'
              onChange={(e) => setParam(e as any)}
            />
            <TextField
              label='Preview images selector'
              value={selectedSetup.previewImagesSelector}
              name='previewImagesSelector'
              onChange={(e) => setParam(e as any)}
            />
            <Button onClick={() => evaluate()} disabled={loading}>
              Evaluate
            </Button>
            <Button onClick={() => enqueue()} disabled={loading}>
              Enqueue
            </Button>
            <Button onClick={() => runItemsIntegration()} disabled={loading}>
              Run Items integration
            </Button>
            <Button onClick={() => runFilesIntegration()} disabled={!!fileIntegrationJob}>
              {fileIntegrationJob ? 'Files integration up' : 'Start Files Integration'}
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {loading && <p>please wait...</p>}
          {<p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} loading={loading} />
          </Box>
        </Grid>
      </Container>
    </>
  );
};

export default Integration;
