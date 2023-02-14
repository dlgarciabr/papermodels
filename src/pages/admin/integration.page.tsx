import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke, useMutation } from '@blitzjs/rpc';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { IntegrationLog, IntegrationSetup, ItemIntegrationStatus } from '@prisma/client';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import getIntegrationSetups from 'src/integration-setups/queries/getIntegrationSetups';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IError } from '../api/integration/types';
import { getSimpleRandomKey } from 'src/utils/global';
import getLogs from 'src/integration-logs/queries/getIntegrationLogs';
import deleteItemIntegrationByStatus from 'src/item-integration/mutations/deleteItemIntegrationByStatus';
import { TbChevronDown } from 'react-icons/tb';

const Integration = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
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
    descriptionSelector: '',
    schemesSelector: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [integrationSetups, setIntegrationSetups] = useState<IntegrationSetup[]>([]);
  const [errors, setErrors] = useState<IError[]>([]);
  const [fileIntegrationJob, setFileIntegrationJob] = useState<NodeJS.Timeout>();
  const [simulationIntegrationJob, setSimulationIntegrationJob] = useState<NodeJS.Timeout | null>();
  const [deleteItemIntegrationMutation] = useMutation(deleteItemIntegrationByStatus);

  const loadSetups = async () => {
    const { integrationSetups } = await invoke(getIntegrationSetups, {
      orderBy: { name: 'asc' }
    });
    setIntegrationSetups(integrationSetups);
  };

  const _validateJson = (text: string) => {
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  };

  const feedLog = async () => {
    setLoading(true);
    const { integrationLogs } = await invoke(getLogs, {
      orderBy: { reference: 'asc' }
    });
    setLogs(integrationLogs);
    setLoading(false);
    if (!simulationIntegrationJob) {
      setSimulationIntegrationJob(setTimeout(() => feedLog(), 30000));
    }
  };

  const enqueue = async (simulate: boolean = false) => {
    setErrors([]);

    if (selectedSetup.id === 0) {
      alert('Select a setup first');
      return;
    }
    setLoading(true);

    if (simulate) {
      await deleteItemIntegrationMutation({ status: ItemIntegrationStatus.simulation });
    }

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
          ...selectedSetup,
          simulate
        })
      });

      if (simulate) {
        await fetch(`${location.origin}/api/integration?simulation=true`);
        void feedLog();
      }
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

  useEffect(() => {
    if (logs.length > 0) {
      setSimulationIntegrationJob(null);
    }
  }, [logs]);

  const columns: GridColDef[] = [
    { field: 'id', width: 10 },
    { field: 'reference', headerName: 'ref', width: 400 },
    { field: 'value', headerName: 'value', width: 400 }
  ];

  let rows: { id: number; reference: string; value: string }[] = [];

  if (logs.length > 0) {
    rows = logs.map((log) => ({ id: log.id, reference: log.reference, value: log.value }));
  }

  return (
    <>
      <Head>
        <title>Papermodels</title>
      </Head>
      <Container component='main'>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InputLabel id='selected-setup-label'>Setup</InputLabel>
            <Select
              labelId='selected-setup-label'
              id='selectedSetup'
              value={selectedSetup.id}
              label='Setup'
              fullWidth
              onChange={(e) => handleSelectSetup(Number(e.target.value))}>
              {integrationSetups.map((item) => (
                <MenuItem key={Math.random().toString(36).substring(2, 15)} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
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
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<TbChevronDown />} aria-controls='panel1a-content' id='panel1a-header'>
                <Typography>Setup details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
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
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Button onClick={() => enqueue(true)} disabled={loading || !!simulationIntegrationJob} variant='outlined'>
              Simulate
            </Button>
            <Button onClick={() => enqueue()} disabled={loading} variant='outlined'>
              Enqueue
            </Button>
            <Button onClick={() => runItemsIntegration()} disabled={loading} variant='outlined'>
              Run Items integration
            </Button>
            <Button onClick={() => runFilesIntegration()} disabled={!!fileIntegrationJob} variant='outlined'>
              {fileIntegrationJob ? 'Files integration up' : 'Init files integration'}
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
