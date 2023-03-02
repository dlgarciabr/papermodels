import { Suspense, useContext, useState, useEffect } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { invoke, useMutation } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import getItems from 'src/items/queries/getItems';
import deleteItem from 'src/items/mutations/deleteItem';
import { Item, ItemStatus } from '@prisma/client';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import createSystemParameters from 'src/system-parameter/mutations/createSystemParameters';
import { SystemParameterType } from 'types';
import { TextField } from '@mui/material';
import deleteSystemParameters from 'src/system-parameter/mutations/deleteSystemParameters';

const ITEMS_PER_PAGE = 10;

export const ItemsList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;
  const [statusFilter, setStatusFilter] = useState<ItemStatus | string>('');
  const [nameFilter, setNameFilter] = useState<String>('');

  const [deleteItemMutation] = useMutation(deleteItem);
  const [createSystemParametersMutation] = useMutation(createSystemParameters);
  const [deleteSystemParametersMutation] = useMutation(deleteSystemParameters);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const goToPage = (page: number) => {
    console.log(page);
    void router.push({ query: { page: page } });
  };
  const goToEditPage = (id: number) => router.push(Routes.EditItemPage({ itemId: id }));

  const loadItems = async (useFilters: boolean = false) => {
    const where = {} as any;
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (nameFilter) {
      where.name = {
        contains: nameFilter,
        mode: 'insensitive'
      };
    }
    if (useFilters && Object.keys(where).length > 0) {
      const { items, hasMore, count } = await invoke(getItems, {
        orderBy: { name: 'asc' },
        skip: ITEMS_PER_PAGE * page,
        take: ITEMS_PER_PAGE,
        where
      });
      setItems(items);
      setCount(count);
      setHasMore(hasMore);
    } else {
      const { items, hasMore, count } = await invoke(getItems, {
        orderBy: { name: 'asc' },
        skip: ITEMS_PER_PAGE * page,
        take: ITEMS_PER_PAGE
      });
      setItems(items);
      setCount(count);
      setHasMore(hasMore);
    }
  };

  const reintegrateItem = async (itemName: string) => {
    await deleteSystemParametersMutation({
      keys: [SystemParameterType.INTEGRATION_ITEM_REPLACE, SystemParameterType.INTEGRATION_ITEM_NAME]
    });
    await createSystemParametersMutation([
      {
        key: SystemParameterType.INTEGRATION_ITEM_REPLACE,
        value: String(true)
      },
      {
        key: SystemParameterType.INTEGRATION_ITEM_NAME,
        value: itemName
      }
    ]);
    await router.push(Routes.Integration());
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const columns: GridColDef[] = [
    { field: 'id', width: 10 },
    { field: 'name', headerName: 'Name', width: 600 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 's',
      headerName: 'actions',
      sortable: false,
      width: 250,
      renderCell: (params) => {
        return (
          <Grid container>
            <Grid item xs={6}>
              <button type='button' onClick={() => goToEditPage(Number(params.id))} style={{ marginLeft: '0.5rem' }}>
                edit
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
                <button type='button' onClick={() => reintegrateItem(params.row.name)} style={{ marginLeft: '0.5rem' }}>
                  reintegrate
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
    rows = items.map((item) => ({ id: item.id, name: item.name, status: item.status, setupId: item.setupId }));
  }

  return (
    <Grid container>
      <Grid item xs={5}>
        <TextField label='Name' fullWidth value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
      </Grid>
      <Grid item xs={5}>
        <Select
          id='status'
          label='Status'
          name='status'
          placeholder='Status'
          fullWidth
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ItemStatus)}>
          <MenuItem value={ItemStatus.integrating}>{ItemStatus.integrating}</MenuItem>
          <MenuItem value={ItemStatus.enable}>{ItemStatus.enable}</MenuItem>
          <MenuItem value={ItemStatus.validate}>{ItemStatus.validate}</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={2}>
        <Button onClick={() => loadItems(true)}>Search</Button>
        <Button
          onClick={() => {
            setNameFilter('');
            setStatusFilter('');
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
            paginationMode='server'
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <div>
          <button disabled={page === 0} onClick={goToPreviousPage}>
            Previous
          </button>
          <button disabled={!hasMore} onClick={goToNextPage}>
            Next
          </button>
        </div>
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
