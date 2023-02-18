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
import { FileSimulationReference, IntegrationSelector, IntegrationSelectorType } from 'types';

interface IIntegrationLogFilter {
  field: string;
  value: string;
}

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
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [integrationSetups, setIntegrationSetups] = useState<IntegrationSetup[]>([]);
  const [errors, setErrors] = useState<IError[]>([]);
  const [fileIntegrationJob, setFileIntegrationJob] = useState<NodeJS.Timeout | null>();
  const [simulationIntegrationJob, setSimulationIntegrationJob] = useState<NodeJS.Timeout | null>();
  const [deleteItemIntegrationMutation] = useMutation(deleteItemIntegrationByStatus);
  const [filter, setFilter] = useState<IIntegrationLogFilter>({ field: '', value: '' });

  const loadSimulationLogs = async (filter?: IIntegrationLogFilter) => {
    if (filter) {
      if (!filter.field || !filter.value) {
        alert('fill filters');
        return;
      }
      let where = {};
      where[filter.field] = { contains: filter.value };
      const { integrationLogs } = await invoke(getLogs, {
        orderBy: { key: 'asc' },
        where
      });
      setLogs(integrationLogs);
    } else {
      const { integrationLogs } = await invoke(getLogs, {
        orderBy: { key: 'asc' }
      });
      setLogs(integrationLogs);
    }
  };

  const loadSetups = async () => {
    const { integrationSetups } = await invoke(getIntegrationSetups, {
      orderBy: { name: 'asc' }
    });
    setIntegrationSetups(integrationSetups);
  };

  const validateJson = (text: string) => {
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateAllSelectors = () => {
    setFieldErrors([]);
    const errors: string[] = [];
    const hasItemUrlSelector = validateJson(selectedSetup.itemUrlSelector);
    if (!hasItemUrlSelector) {
      errors.push('itemUrlSelector');
    }

    const hasPreviewImagesSelector = validateJson(selectedSetup.previewImagesSelector);
    if (!hasPreviewImagesSelector) {
      errors.push('previewImagesSelector');
    }

    const hasDescriptionSelector =
      !!selectedSetup.descriptionSelector && validateJson(selectedSetup.descriptionSelector);
    if (!hasDescriptionSelector) {
      errors.push('descriptionSelector');
    }

    const hasCategorySelector = !!selectedSetup.categorySelector && validateJson(selectedSetup.categorySelector);
    if (!hasCategorySelector) {
      errors.push('categorySelector');
    }

    const hasSchemesSelector = !!selectedSetup.schemesSelector && validateJson(selectedSetup.schemesSelector);
    if (hasSchemesSelector) {
      const schemeSelectors = JSON.parse(selectedSetup.schemesSelector) as IntegrationSelector[];
      const linkSelector = schemeSelectors.find((selector) => selector.type === IntegrationSelectorType.LINK);
      const clickSelector = schemeSelectors.find((selector) => selector.type === IntegrationSelectorType.CLICK);
      if (!linkSelector && !clickSelector) {
        errors.push('schemesSelector');
      }
    } else {
      errors.push('schemesSelector');
    }

    setFieldErrors(errors);
    return errors;
  };

  const feedLog = async () => {
    setLoading(true);
    await loadSimulationLogs();
    if (!simulationIntegrationJob) {
      setSimulationIntegrationJob(setTimeout(() => feedLog(), 15000));
    }
  };

  const enqueue = async (simulate: boolean = false) => {
    setLogs([]);
    setErrors([]);

    if (selectedSetup.id === 0) {
      alert('Select a setup first');
      return;
    }

    if (validateAllSelectors().length > 0) {
      alert('Review invalid seletor(s)');
      return;
    }

    setLoading(true);

    try {
      const antiCSRFToken = getAntiCSRFToken();
      const response = await fetch(`${location.origin}/api/integration/enqueue`, {
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
      if (response.status === 204) {
        setLoading(false);
        return;
      }
      if (simulate) {
        void runFilesIntegration();
        void feedLog();
        await fetch(`${location.origin}/api/integration?simulation=true`);
      }
    } catch (error) {
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration/enqueue'
        }
      ]);
    }
  };

  const deleteErrorIntegration = async () => {
    runFilesIntegration;
    await deleteItemIntegrationMutation({ status: ItemIntegrationStatus.error });
    alert('cleaned!');
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
        setFileIntegrationJob(setTimeout(() => runFilesIntegration(), 30000));
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
    void loadSimulationLogs();
  }, []);

  useEffect(() => {
    const filesIntegrationfinished = logs.some((log) => log.key === FileSimulationReference.schemePercentage);
    if (filesIntegrationfinished) {
      clearTimeout(simulationIntegrationJob!);
      clearTimeout(fileIntegrationJob!);
      setSimulationIntegrationJob(null);
      setFileIntegrationJob(null);
      setLoading(false);
    }
  }, [fileIntegrationJob, logs, simulationIntegrationJob]);

  const columns: GridColDef[] = [
    { field: 'id', width: 10 },
    { field: 'key', headerName: 'key', width: 200 },
    { field: 'reference', headerName: 'ref', width: 700 },
    { field: 'value', headerName: 'value', width: 200 }
  ];

  let rows: {
    id: number;
    key: string;
    reference: string;
    value: string;
  }[] = [];

  if (logs.length > 0) {
    rows = logs.map((log) => ({ id: log.id, key: log.key, reference: log.reference, value: log.value }));
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
              value={selectedSetup.id !== 0 ? selectedSetup.id : ''}
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
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('itemUrlSelector')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Description selector'
                      value={selectedSetup.descriptionSelector}
                      name='descriptionSelector'
                      fullWidth
                      multiline
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('descriptionSelector')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Preview images selector'
                      value={selectedSetup.previewImagesSelector}
                      name='previewImagesSelector'
                      fullWidth
                      multiline
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('previewImagesSelector')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Category selector'
                      value={selectedSetup.categorySelector}
                      name='categorySelector'
                      fullWidth
                      multiline
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('categorySelector')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Schemes selector'
                      value={selectedSetup.schemesSelector}
                      name='schemesSelector'
                      fullWidth
                      multiline
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('schemesSelector')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Category binding'
                      value={selectedSetup.categoryBinding}
                      name='categoryBinding'
                      fullWidth
                      multiline
                      disabled={true}
                      rows={6}
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.includes('categoryBinding')}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Button onClick={() => enqueue(true)} variant='outlined' disabled={!!simulationIntegrationJob}>
              Simulate
            </Button>
            <Button onClick={() => enqueue()} disabled={loading || !!simulationIntegrationJob} variant='outlined'>
              Enqueue
            </Button>
            <Button
              onClick={() => runItemsIntegration()}
              disabled={loading || !!simulationIntegrationJob}
              variant='outlined'>
              Run Items integration
            </Button>
            <Button onClick={() => runFilesIntegration()} disabled={!!fileIntegrationJob} variant='outlined'>
              {fileIntegrationJob ? 'Files integration up' : 'Init files integration'}
            </Button>
            <Button onClick={() => deleteErrorIntegration()} variant='outlined' disabled={!!simulationIntegrationJob}>
              Clean integration w/ error
            </Button>
          </Grid>
        </Grid>
        <Grid item container xs={12} spacing={2}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='Field'
              value={filter.field}
              onChange={(e) => setFilter({ ...filter, field: e.target.value })}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='Value'
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
            />
          </Grid>
          <Grid item xs={2}>
            <Button onClick={() => loadSimulationLogs(filter)} variant='outlined'>
              filter
            </Button>
            <Button onClick={() => loadSimulationLogs()} variant='outlined'>
              clear
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
          <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[10]} loading={loading} />
          </Box>
        </Grid>
      </Container>
    </>
  );
};

export default Integration;
