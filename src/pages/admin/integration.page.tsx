import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke } from '@blitzjs/rpc';
import { Button, Container, Grid, TextField } from '@mui/material';
import { IntegrationSetup } from '@prisma/client';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import getIntegrationSetups from 'src/integration-setups/queries/getIntegrationSetups';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IError } from '../api/integration/types';
import { getSimpleRandomKey } from 'src/utils/global';

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
  const [errors, setErrors] = useState<IError[]>([]);
  const [fileIntegrationJob, setFileIntegrationJob] = useState<NodeJS.Timeout>();

  const loadSetups = async () => {
    const { integrationSetups } = await invoke(getIntegrationSetups, {
      orderBy: { name: 'asc' }
    });
    setIntegrationSetups(integrationSetups);
  };

  const evaluate = async () => {
    setItems([]);
    setErrors([]);
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
        body: JSON.stringify(selectedSetup)
      });
      const text = await response.text();
      const json = JSON.parse(text);
      if (json.errors) {
        setErrors(json.errors);
      } else {
        setItems(json);
      }
    } catch (error) {
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration/evaluateSetup'
        }
      ]);
    }
    setLoading(false);
  };

  const enqueue = async () => {
    setErrors([]);
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
        body: JSON.stringify(selectedSetup)
      });
    } catch (error) {
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration/enqueue'
        }
      ]);
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
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration'
        }
      ]);
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
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration/files'
        }
      ]);
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

  const rows = items.length > 0 ? items.map((item) => ({ id: item })) : [];

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
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='Item url selector'
              value={selectedSetup.itemUrlSelector}
              name='itemUrlSelector'
              fullWidth
              multiline
              rows={6}
              onChange={(e) => setParam(e as any)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='Description selector'
              value={selectedSetup.descriptionSelector}
              name='descriptionSelector'
              fullWidth
              multiline
              rows={6}
              onChange={(e) => setParam(e as any)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label='Preview images selector'
              value={selectedSetup.previewImagesSelector}
              name='previewImagesSelector'
              fullWidth
              multiline
              rows={6}
              onChange={(e) => setParam(e as any)}
            />
          </Grid>
          <Grid item xs={12}>
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
          {errors.map((error) => (
            <div key={getSimpleRandomKey()}>
              <p style={{ color: 'red', fontWeight: 'bold' }}>{error.message}</p>
              <p style={{ color: 'red', marginLeft: '20px' }}>{error.reference}</p>
              <p style={{ color: 'red', marginLeft: '20px' }}>{error.value}</p>
              <p style={{ color: 'red', marginLeft: '20px' }}>{error.stack}</p>
            </div>
          ))}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} loading={loading} />
          </Box>
        </Grid>
      </Container>
    </>
  );
};

export default Integration;
