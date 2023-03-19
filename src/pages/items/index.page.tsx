/* istanbul ignore file -- @preserve */
//TODO implement missing tests

import { Suspense, useContext, useState, useEffect } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { invoke, useMutation } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import getItems from 'src/items/queries/getItems';
import deleteItem from 'src/items/mutations/deleteItem';
import { FileType, ItemIntegrationLog, ItemStatus } from '@prisma/client';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import createSystemParameters from 'src/system-parameter/mutations/createSystemParameters';
import { ItemWithChildren, SystemParameterType } from 'types';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  TextField,
  Typography
} from '@mui/material';
import deleteSystemParameters from 'src/system-parameter/mutations/deleteSystemParameters';
import { getSimpleRandomKey } from 'src/utils/global';

const ITEMS_PER_PAGE = 10;

const filtersInitialValue = {
  name: '',
  status: '',
  suspect: false
};

export const ItemsList = () => {
  const [items, setItems] = useState<ItemWithChildren[]>([]);
  const [count, setCount] = useState(0);
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;
  const [filters, setFilters] = useState<{ name: string | ''; status: ItemStatus | string; suspect: boolean }>({
    ...filtersInitialValue
  });
  const [deleteItemMutation] = useMutation(deleteItem);
  const [createSystemParametersMutation] = useMutation(createSystemParameters);
  const [deleteSystemParametersMutation] = useMutation(deleteSystemParameters);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>();

  const goToPage = (page: number) => {
    void router.push({ query: { page: page } });
  };
  const goToEditPage = (id: number) => router.push(Routes.EditItemPage({ itemId: id }));

  const goToPreviewPage = (id: number) => window.open(`${location.pathname}/${id}`, '_blank');

  const filterSuspectItems = (items: ItemWithChildren[]) => {
    let filteredItems: ItemWithChildren[];

    //no pdf
    filteredItems = items.filter(
      (item) =>
        item.files.filter((file) => file.artifactType === FileType.scheme && file.storagePath.endsWith('.pdf'))
          .length === 0
    );

    //more then one schema file
    filteredItems = [
      ...filteredItems,
      ...items.filter((item) => item.files.filter((file) => file.artifactType === FileType.scheme).length > 1)
    ];

    return filteredItems;
  };

  const loadItems = async () => {
    const where = {} as any;
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      };
    }

    let takeParam = {};

    if (!filters.suspect) {
      takeParam = {
        take: ITEMS_PER_PAGE
      };
    }

    if (Object.keys(where).length > 0) {
      const { items, count } = await invoke(getItems, {
        orderBy: { name: 'asc' },
        skip: ITEMS_PER_PAGE * page,
        ...takeParam,
        include: {
          itemIntegrationLogs: true,
          files: true,
          category: true
        },
        where
      });
      if (filters.suspect) {
        const filtered = filterSuspectItems(items as ItemWithChildren[]);
        setItems(filtered);
        setCount(filtered.length);
      } else {
        setItems(items as ItemWithChildren[]);
        setCount(count);
      }
    } else {
      const { items, count } = await invoke(getItems, {
        orderBy: { name: 'asc' },
        skip: ITEMS_PER_PAGE * page,
        ...takeParam,
        include: {
          itemIntegrationLogs: true,
          files: true,
          category: true
        }
      });
      if (filters.suspect) {
        const filtered = filterSuspectItems(items as ItemWithChildren[]);
        setItems(filtered);
        setCount(filtered.length);
      } else {
        setItems(items as ItemWithChildren[]);
        setCount(count);
      }
    }
  };

  const reintegrateItem = async (id) => {
    await deleteSystemParametersMutation({
      keys: [SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID]
    });
    await createSystemParametersMutation([
      {
        key: SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID,
        value: String(id)
      }
    ]);
    await router.push(Routes.Integration());
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns: GridColDef[] = [
    { field: 'id', width: 10, headerAlign: 'center' },
    { field: 'name', headerName: 'Name', width: 500, headerAlign: 'center' },
    { field: 'category', headerName: 'Category', width: 150, headerAlign: 'center', align: 'center' },
    { field: 'previewsQty', headerName: 'Previews', width: 5, headerAlign: 'center', align: 'center' },
    { field: 'schemesQty', headerName: 'Squemes', width: 5, headerAlign: 'center', align: 'center' },
    { field: 'schemesPdfs', headerName: 'PDFs', width: 5, headerAlign: 'center', align: 'center' },
    { field: 'status', headerName: 'Status', width: 100, headerAlign: 'center', align: 'center' },
    {
      field: 's',
      headerName: 'actions',
      sortable: false,
      headerAlign: 'center',
      width: 300,
      renderCell: (params) => {
        return (
          <Grid container>
            <Grid item xs={6}>
              <button type='button' onClick={() => goToEditPage(Number(params.id))} style={{ marginLeft: '0.5rem' }}>
                edit
              </button>
              <button type='button' onClick={() => goToPreviewPage(Number(params.id))} style={{ marginLeft: '0.5rem' }}>
                preview
              </button>
              <button
                type='button'
                onClick={async () => {
                  /* istanbul ignore else -- @preserve */
                  if (window.confirm('This item will be deleted')) {
                    await deleteItemMutation({ id: Number(params.id) });
                    showToast(ToastType.SUCCESS, 'Item successfully removed!');
                    void loadItems();
                  }
                }}
                style={{ marginLeft: '0.5rem' }}>
                delete
              </button>
              {params.row.setupId && (
                <button type='button' onClick={() => reintegrateItem(params.row.id)} style={{ marginLeft: '0.5rem' }}>
                  reintegrate
                </button>
              )}
              {items.find((item) => item.id === params.id)!.itemIntegrationLogs.length > 0 && (
                <button
                  type='button'
                  onClick={() => {
                    setSelectedItemId(Number(params.id));
                    setOpenLogDialog(true);
                  }}
                  style={{ marginLeft: '0.5rem' }}>
                  Int. logs
                </button>
              )}
            </Grid>
          </Grid>
        );
      }
    }
  ];

  let rows: {
    id: number;
    name: string;
  }[] = [];

  if (items.length > 0) {
    rows = items.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      setupId: item.setupId,
      category: item.category.name,
      previewsQty: item.files.filter((file) => file.artifactType === FileType.preview).length,
      schemesQty: item.files.filter((file) => file.artifactType === FileType.scheme).length,
      schemesPdfs: item.files.filter(
        (file) => file.artifactType === FileType.scheme && file.storagePath.endsWith('.pdf')
      ).length
    }));
  }

  const renderLogDialog = () => {
    let itemIntegrationLogs: ItemIntegrationLog[] = [];
    if (selectedItemId && items.length > 0) {
      const selectedItem = items.find((item) => item.id === selectedItemId);
      if (selectedItem?.itemIntegrationLogs) {
        itemIntegrationLogs = [...selectedItem?.itemIntegrationLogs!];
      }
    }
    return (
      <Dialog open={openLogDialog} fullWidth={true} maxWidth='lg'>
        <DialogTitle>Logs</DialogTitle>
        <DialogContent>
          <Box noValidate component='form' sx={{ height: 650, width: 1000 }}>
            {itemIntegrationLogs.map((log) => (
              <div key={getSimpleRandomKey()}>
                ------------------------------------------------------------------------------------------------------------------------------
                <Typography>{log.message}</Typography>
                <Typography>{log.errorStack}</Typography>
              </div>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Grid container>
      {renderLogDialog()}
      <Grid item xs={5}>
        <TextField
          label='Name'
          fullWidth
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              void loadItems();
              ev.preventDefault();
            }
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth>
          <InputLabel id='statusLabel'>Status</InputLabel>
          <Select
            id='status'
            label='Status'
            labelId='statusLabel'
            name='status'
            placeholder='Status'
            fullWidth
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as ItemStatus })}>
            <MenuItem value={ItemStatus.integrating}>{ItemStatus.integrating}</MenuItem>
            <MenuItem value={ItemStatus.disable}>{ItemStatus.disable}</MenuItem>
            <MenuItem value={ItemStatus.enable}>{ItemStatus.enable}</MenuItem>
            <MenuItem value={ItemStatus.validate}>{ItemStatus.validate}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <Checkbox checked={filters.suspect} onChange={() => setFilters({ ...filters, suspect: !filters.suspect })} />
        Suspect
      </Grid>
      <Grid item xs={2}>
        <Button onClick={() => loadItems()}>Search</Button>
        <Button
          onClick={() => {
            setFilters({ ...filtersInitialValue });
            void loadItems();
          }}>
          Clear
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            onPageChange={(page) => goToPage(page)}
            rowCount={count}
            page={page}
            paginationMode={filters.suspect ? 'client' : 'server'}
            disableVirtualization={true}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

const ItemsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Items</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.AdminPage()}>
            <a>Admin page</a>
          </Link>
        </p>
        <p>
          <Link href={Routes.NewItemPage()}>
            <a>Create Item</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <ItemsList />
        </Suspense>
      </div>
    </Layout>
  );
};

ItemsPage.authenticate = { redirectTo: '/admin' };

export default ItemsPage;
