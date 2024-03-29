/* istanbul ignore file -- @preserve */
//TODO implement tests with ChatGPT
import { getAntiCSRFToken } from '@blitzjs/auth';
import { invoke, useMutation } from '@blitzjs/rpc';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
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
import {
  FileSimulationReference,
  IntegrationProcessingQtyType,
  IntegrationProcessingType,
  IntegrationSelector,
  IntegrationSelectorType,
  ItemSimulationReference,
  SystemParameterType
} from 'types';
import { MdContentCopy } from 'react-icons/md';
import { ToastType } from 'src/core/components/Toast/types.d';
import { showToast } from 'src/core/components/Toast';
import getSystemParameters from 'src/system-parameter/queries/getSystemParameters';
import { shortenTextWithEllipsis } from 'src/utils/string';
import updateIntegrationSetup from 'src/integration-setups/mutations/updateIntegrationSetup';
import { Routes } from '@blitzjs/next';
import Link from 'next/link';
import getItem from 'src/items/queries/getItem';
import createIntegrationSetup from 'src/integration-setups/mutations/createIntegrationSetup';
import Selector from 'src/core/components/Selector';
import deleteIntegrationSetup from 'src/integration-setups/mutations/deleteIntegrationSetup';

interface IIntegrationLogFilter {
  field: string;
  value: string;
}

const initialSetupValue = Object.freeze({
  id: 0,
  name: '',
  key: '',
  domain: '',
  itemUrlSelector: '',
  previewImagesSelector: '',
  categorySelector: '',
  ignoreExpressions: '',
  author: '',
  authorLink: '',
  licenseType: '',
  licenseTypeLink: '',
  categoryBinding: '',
  descriptionSelector: '',
  schemesSelector: '',
  createdAt: new Date(),
  updatedAt: new Date()
});

const Integration = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<IntegrationSetup>({ ...initialSetupValue });
  const [fieldErrors, setFieldErrors] = useState<{ key: string; error: string }[]>([]);
  const [integrationSetups, setIntegrationSetups] = useState<IntegrationSetup[]>([]);
  const [errors, setErrors] = useState<IError[]>([]);
  const [fileIntegrationJob, setFileIntegrationJob] = useState<NodeJS.Timeout | null>();
  const [simulationIntegrationJob, setSimulationIntegrationJob] = useState<NodeJS.Timeout | null>();
  const [deleteItemIntegrationMutation] = useMutation(deleteItemIntegrationByStatus);
  const [filter, setFilter] = useState<IIntegrationLogFilter>({ field: '', value: '' });
  const [itemName, setItemName] = useState<string>('');
  const [reintegrateItemId, setReintegrateItemId] = useState<number | null>();
  const [processingQtyType, setProcessingQtyType] = useState<IntegrationProcessingQtyType>(
    IntegrationProcessingQtyType.ONE
  );
  const [updateIntegrationSetupMutation] = useMutation(updateIntegrationSetup);
  const [createIntegrationSetupMutation] = useMutation(createIntegrationSetup);
  const [deleteIntegrationSetupMutation] = useMutation(deleteIntegrationSetup);
  const [expandedAccordion, setExpandedAccordion] = useState(false);
  const [creatingSetup, setCreatingSetup] = useState<boolean>(false);
  const [replaceItems, setReplaceItems] = useState<boolean>(false);

  const updateSelector = async () => {
    if (validateAllSelectors().length > 0) {
      setExpandedAccordion(true);
      showToast(ToastType.ERROR, 'Review invalid seletor(s)');
      return;
    }
    await updateIntegrationSetupMutation(selectedSetup);
    showToast(ToastType.SUCCESS, 'Selector updated!');
  };

  const loadSimulationLogs = async (filter?: IIntegrationLogFilter) => {
    if (filter) {
      if (!filter.field || !filter.value) {
        showToast(ToastType.WARNING, 'fill filters');
        return;
      }
      let where = {};
      where[filter.field] = {
        contains: filter.value,
        mode: 'insensitive'
      };
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
    const errors: { key: string; error: string }[] = [];

    const hasItemUrlSelector = validateJson(selectedSetup.itemUrlSelector);
    if (!hasItemUrlSelector || JSON.parse(selectedSetup.itemUrlSelector).length === 0) {
      errors.push({ key: 'itemUrlSelector', error: 'selector required' });
    }

    // const hasPreviewImagesSelector = validateJson(selectedSetup.previewImagesSelector);
    // if (!hasPreviewImagesSelector) {
    //   errors.push({ key: 'previewImagesSelector', error: 'selector required' });
    // }

    // const hasCategorySelector = !!selectedSetup.categorySelector && validateJson(selectedSetup.categorySelector);
    // if (!hasCategorySelector) {
    //   errors.push({ key: 'categorySelector', error: 'selector required' });
    // }

    // const hasCategoryBinding = !!selectedSetup.categoryBinding && validateJson(selectedSetup.categoryBinding);
    // if (!hasCategoryBinding) {
    //   errors.push({ key: 'categoryBinding', error: 'selector required' });
    // }

    const hasSchemesSelector = !!selectedSetup.schemesSelector && validateJson(selectedSetup.schemesSelector);
    if (hasSchemesSelector) {
      const schemeSelectors = JSON.parse(selectedSetup.schemesSelector) as IntegrationSelector[];
      const linkSelector = schemeSelectors.find((selector) => selector.type === IntegrationSelectorType.LINK);
      const clickSelector = schemeSelectors.find((selector) => selector.type === IntegrationSelectorType.CLICK);
      if (!linkSelector && !clickSelector) {
        errors.push({ key: 'schemesSelector', error: 'selector required' });
      }
    } else {
      errors.push({ key: 'schemesSelector', error: 'selector required' });
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

  const processIntegrationSetup = async (type: IntegrationProcessingType) => {
    setLogs([]);
    setErrors([]);

    if (selectedSetup.id === 0) {
      showToast(ToastType.ERROR, 'Select a setup first');
      return;
    }

    if (validateAllSelectors().length > 0) {
      setExpandedAccordion(true);
      showToast(ToastType.ERROR, 'Review invalid seletor(s)');
      return;
    }

    setLoading(true);

    try {
      const antiCSRFToken = getAntiCSRFToken();
      const response = await fetch(`${location.origin}/api/integration/initialize`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        },
        body: JSON.stringify({
          ...selectedSetup,
          type,
          processingQtyType,
          itemName,
          reintegrateItemId,
          replaceItems
        })
      });
      if (response.status === 204) {
        setLoading(false);
        return;
      }
      void runUrlsIntegration();
      void feedLog();
      if (type === IntegrationProcessingType.SIMULATION || type === IntegrationProcessingType.INTEGRATION) {
        void runFilesIntegration();
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
    showToast(ToastType.SUCCESS, 'Errors cleaned!');
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

  const runUrlsIntegration = async () => {
    try {
      const antiCSRFToken = getAntiCSRFToken();
      await fetch(`${location.origin}/api/integration/urls`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'anti-csrf': antiCSRFToken
        }
      });
    } catch (error) {
      setErrors([
        {
          ...JSON.parse(JSON.stringify(error)),
          reference: '/api/integration/urls'
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
    handleChangeSelector(e.target.name, e.target.value);
  };

  const handleChangeSelector = (selectorKey: string, jsonSelector: string) => {
    setSelectedSetup({
      ...selectedSetup,
      [selectorKey]: jsonSelector
    });
  };

  useEffect(() => {
    void loadSetups();
    void loadSimulationLogs();
    void (async () => {
      const { systemParameters } = await invoke(getSystemParameters, {
        where: {
          key: SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
        }
      });
      const paramReintegrateItemId = systemParameters.find(
        (params) => params.key === SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
      );
      if (paramReintegrateItemId) {
        const item = await invoke(getItem, {
          id: Number(paramReintegrateItemId.value)
        });
        if (item) {
          setItemName(item.name);
          setReintegrateItemId(item.id);
          setSelectedSetup((item as any).setup);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (itemName) {
      setProcessingQtyType(IntegrationProcessingQtyType.FULL);
    }
  }, [itemName]);

  useEffect(() => {
    void (async () => {
      const { systemParameters } = await invoke(getSystemParameters, {
        orderBy: { key: 'asc' },
        where: {
          key: SystemParameterType.INTEGRATION_TYPE
        }
      });

      if (systemParameters.length > 0) {
        const type = systemParameters[0]?.value as IntegrationProcessingType;

        let integrationFinished: boolean = false;

        switch (type) {
          case IntegrationProcessingType.READ_URLS:
            integrationFinished =
              logs.some((log) => log.key === ItemSimulationReference.initialQuantity) &&
              logs.some((log) => log.reference === 'Global' && log.key === ItemSimulationReference.url);
            break;
          case IntegrationProcessingType.SIMULATION:
            integrationFinished =
              logs.some((log) => log.key === ItemSimulationReference.initialQuantity) &&
              logs.some((log) => log.key === ItemSimulationReference.categoryPercentage) &&
              logs.some((log) => log.key === ItemSimulationReference.descriptionPencentage) &&
              logs.some((log) => log.key === ItemSimulationReference.previewImagesPencentage) &&
              logs.some((log) => log.key === FileSimulationReference.schemePercentage) &&
              logs.some((log) => log.key === ItemSimulationReference.totalTime);
            break;
          case IntegrationProcessingType.INTEGRATION:
            integrationFinished =
              logs.some((log) => log.key === FileSimulationReference.schemePercentage) &&
              logs.some((log) => log.key === ItemSimulationReference.totalTime);
            break;
        }

        if (integrationFinished) {
          clearTimeout(simulationIntegrationJob!);
          clearTimeout(fileIntegrationJob!);
          setSimulationIntegrationJob(null);
          setFileIntegrationJob(null);
          setLoading(false);
        }
      }
    })();
  }, [fileIntegrationJob, logs, simulationIntegrationJob]);

  const sendToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    showToast(ToastType.INFO, 'Text sent to clipboard.');
  };

  const handleClickSaveSetup = async () => {
    await createIntegrationSetupMutation({
      ...selectedSetup,
      descriptionSelector: '[]',
      itemUrlSelector: '[]',
      previewImagesSelector: '[]',
      categorySelector: '[]',
      categoryBinding: '[]',
      schemesSelector: '[]'
    });
    showToast(ToastType.SUCCESS, 'Setup created!');
    setSelectedSetup({ ...initialSetupValue });
    setCreatingSetup(false);
    void loadSetups();
  };

  const handleClickDeleteSetup = async () => {
    await deleteIntegrationSetupMutation({ id: selectedSetup.id });
    showToast(ToastType.SUCCESS, 'Setup deleted!');
    setSelectedSetup({ ...initialSetupValue });
    setCreatingSetup(false);
    void loadSetups();
  };

  const columns: GridColDef[] = [
    { field: 'id', width: 10 },
    { field: 'key', headerName: 'key', width: 150 },
    {
      field: 'reference',
      headerName: 'reference',
      sortable: false,
      width: 450,
      renderCell: (params) => {
        return (
          <Grid container>
            <Grid item xs={11}>
              {shortenTextWithEllipsis(params.row.reference, 50)}
            </Grid>
            <Grid item>
              <div
                className='d-flex justify-content-between align-items-center'
                style={{ cursor: 'pointer' }}
                onClick={() => sendToClipboard(params.row.reference)}>
                <MdContentCopy title='Copy to clipboard' />
              </div>
            </Grid>
          </Grid>
        );
      }
    },
    {
      field: 'value',
      headerName: 'value',
      sortable: false,
      width: 450,
      renderCell: (params) => {
        return (
          <Grid container>
            <Grid item xs={11}>
              {shortenTextWithEllipsis(params.row.value, 50)}
            </Grid>
            <Grid item>
              <div
                className='d-flex justify-content-between align-items-center'
                style={{ cursor: 'pointer' }}
                onClick={() => sendToClipboard(params.row.value)}>
                <MdContentCopy title='Copy to clipboard' />
              </div>
            </Grid>
          </Grid>
        );
      }
    }
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
      <Link href={Routes.AdminPage()}>
        <a>Admin page</a>
      </Link>
      <Container component='main'>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            {creatingSetup ? (
              <TextField
                label='Setup name'
                value={selectedSetup.name}
                name='name'
                fullWidth
                onChange={(e) => setParam(e as any)}
                error={fieldErrors.some((error) => error.key === 'name')}
                size='small'
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel id='selectedSetup'>Setup</InputLabel>
                <Select
                  id='selectedSetup'
                  value={selectedSetup.id !== 0 ? selectedSetup.id : ''}
                  name='selectedSetup'
                  placeholder='Setup'
                  fullWidth
                  size='small'
                  onChange={(e) => handleSelectSetup(Number(e.target.value))}>
                  {integrationSetups.map((item) => (
                    <MenuItem key={Math.random().toString(36).substring(2, 15)} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={4}>
            <TextField
              label='Setup key'
              value={selectedSetup.key}
              name='key'
              fullWidth
              onChange={(e) => setParam(e as any)}
              error={fieldErrors.some((error) => error.key === 'key')}
              size='small'
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              onClick={() => {
                setSelectedSetup({ ...initialSetupValue });
                setCreatingSetup(true);
              }}
              variant='outlined'
              disabled={creatingSetup}>
              New
            </Button>
            <Button onClick={() => handleClickSaveSetup()} variant='outlined' disabled={!creatingSetup}>
              Save
            </Button>
            <Button onClick={() => handleClickDeleteSetup()} variant='outlined' disabled={creatingSetup}>
              Delete
            </Button>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Domain'
              value={selectedSetup.domain}
              name='domain'
              onChange={(e) => setParam(e as any)}
              size='small'
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Item name'
              value={itemName}
              name='itemName'
              onChange={(e) => setItemName(e.target.value)}
              size='small'
            />
          </Grid>
          <Grid item xs={12}>
            <Accordion expanded={expandedAccordion} onChange={() => setExpandedAccordion(!expandedAccordion)}>
              <AccordionSummary expandIcon={<TbChevronDown />} aria-controls='panel1a-content' id='panel1a-header'>
                <Grid container>
                  <Grid item xs={10}>
                    <Typography>Setup details</Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      onClick={(e) => {
                        void updateSelector();
                        e.stopPropagation();
                      }}>
                      Save changes
                    </Button>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Selector
                      label='Item url selector'
                      jsonSelectors={selectedSetup.itemUrlSelector}
                      onChangeSelectors={(json) => handleChangeSelector('itemUrlSelector', json)}
                      leftKey='type'
                      rightKey='value'
                      hasError={fieldErrors.some((error) => error.key === 'itemUrlSelector')}
                      errorMessage={fieldErrors.find((error) => error.key === 'itemUrlSelector')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Selector
                      label='Description selector'
                      jsonSelectors={selectedSetup.descriptionSelector || ''}
                      onChangeSelectors={(json) => handleChangeSelector('descriptionSelector', json)}
                      leftKey='type'
                      rightKey='value'
                      hasError={fieldErrors.some((error) => error.key === 'descriptionSelector')}
                      errorMessage={fieldErrors.find((error) => error.key === 'descriptionSelector')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Selector
                      label='Preview images selector'
                      jsonSelectors={selectedSetup.previewImagesSelector || ''}
                      onChangeSelectors={(json) => handleChangeSelector('previewImagesSelector', json)}
                      leftKey='type'
                      rightKey='value'
                      hasError={fieldErrors.some((error) => error.key === 'previewImagesSelector')}
                      errorMessage={fieldErrors.find((error) => error.key === 'previewImagesSelector')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Selector
                      label='Category selector'
                      jsonSelectors={selectedSetup.categorySelector || ''}
                      onChangeSelectors={(json) => handleChangeSelector('categorySelector', json)}
                      leftKey='type'
                      rightKey='value'
                      hasError={fieldErrors.some((error) => error.key === 'categorySelector')}
                      errorMessage={fieldErrors.find((error) => error.key === 'categorySelector')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Selector
                      label='Schemes selector'
                      jsonSelectors={selectedSetup.schemesSelector || ''}
                      onChangeSelectors={(json) => handleChangeSelector('schemesSelector', json)}
                      leftKey='type'
                      rightKey='value'
                      hasError={fieldErrors.some((error) => error.key === 'schemesSelector')}
                      errorMessage={fieldErrors.find((error) => error.key === 'schemesSelector')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Selector
                      label='Category binding'
                      jsonSelectors={selectedSetup.categoryBinding || ''}
                      onChangeSelectors={(json) => handleChangeSelector('categoryBinding', json)}
                      leftKey='systemCategoryName'
                      rightKey='pageCategoryName'
                      leftXS={5}
                      rightXS={7}
                      hasError={fieldErrors.some((error) => error.key === 'categoryBinding')}
                      errorMessage={fieldErrors.find((error) => error.key === 'categoryBinding')?.error}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Author'
                      value={selectedSetup.author || ''}
                      name='author'
                      fullWidth
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.some((error) => error.key === 'author')}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='Author link'
                      value={selectedSetup.authorLink || ''}
                      name='authorLink'
                      fullWidth
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.some((error) => error.key === 'authorLink')}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='License type'
                      value={selectedSetup.licenseType || ''}
                      name='licenseType'
                      fullWidth
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.some((error) => error.key === 'licenseType')}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label='License type link'
                      value={selectedSetup.licenseTypeLink || ''}
                      name='licenseTypeLink'
                      fullWidth
                      onChange={(e) => setParam(e as any)}
                      error={fieldErrors.some((error) => error.key === 'licenseTypeLink')}
                      size='small'
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <RadioGroup row>
              <Radio
                value={IntegrationProcessingQtyType.ONE}
                checked={processingQtyType === IntegrationProcessingQtyType.ONE}
                onClick={() => {
                  setItemName('');
                  setProcessingQtyType(IntegrationProcessingQtyType.ONE);
                }}
              />
              <Typography>One</Typography>
              <Radio
                value={IntegrationProcessingQtyType.FEW}
                checked={processingQtyType === IntegrationProcessingQtyType.FEW}
                onClick={() => {
                  setItemName('');
                  setProcessingQtyType(IntegrationProcessingQtyType.FEW);
                }}
              />
              <Typography>Few</Typography>
              <Radio
                value={IntegrationProcessingQtyType.INTERMEDIATE}
                checked={processingQtyType === IntegrationProcessingQtyType.INTERMEDIATE}
                onClick={() => {
                  setItemName('');
                  setProcessingQtyType(IntegrationProcessingQtyType.INTERMEDIATE);
                }}
              />
              <Typography>Intermediate</Typography>
              <Radio
                value={IntegrationProcessingQtyType.FULL}
                checked={processingQtyType === IntegrationProcessingQtyType.FULL}
                onClick={() => setProcessingQtyType(IntegrationProcessingQtyType.FULL)}
              />
              <Typography>Full</Typography>
            </RadioGroup>
            <Checkbox value={replaceItems} onClick={() => setReplaceItems(!replaceItems)} />
            Replace items
            <Button
              onClick={() => processIntegrationSetup(IntegrationProcessingType.READ_URLS)}
              variant='outlined'
              disabled={!!simulationIntegrationJob}>
              Read URLs
            </Button>
            <Button
              onClick={() => processIntegrationSetup(IntegrationProcessingType.SIMULATION)}
              variant='outlined'
              disabled={!!simulationIntegrationJob}>
              Simulate
            </Button>
            <Button
              onClick={() => processIntegrationSetup(IntegrationProcessingType.INTEGRATION)}
              disabled={loading || !!simulationIntegrationJob}
              variant='outlined'>
              Integrate
            </Button>
            <Button
              onClick={() => {
                void runFilesIntegration();
                void runItemsIntegration();
              }}
              disabled={loading || !!simulationIntegrationJob || !!fileIntegrationJob}
              variant='outlined'>
              Run integrations
            </Button>
            {/* <Button onClick={() => { void runFilesIntegration(); void runItemsIntegration(); }} disabled={!!fileIntegrationJob} variant='outlined'>
              {fileIntegrationJob ? 'Files integration up' : 'Init files integration'}
            </Button> */}
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
              size='small'
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='Value'
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
              size='small'
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

Integration.authenticate = { redirectTo: '/admin' };

export default Integration;
