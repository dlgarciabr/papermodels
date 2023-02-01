import Layout from 'src/core/layouts/Layout';
import { BlitzPage, RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Pagination
} from '@mui/material';
import { MdClose, MdSearch } from 'react-icons/md';
import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { getSimpleRandomKey } from 'src/utils/global';
import { calculateMarginTop } from './index.utils';
import { useSearch } from './index.hooks';
import { IData } from './items/index.types';
import { ItemWithFiles } from 'types';

const theme = createTheme();

const ItemCard = ({ item }: { item: ItemWithFiles }) => {
  let mainImage = '/images/dog.png';
  if (item.files.length > 0) {
    mainImage = item.files[0]!.storagePath;
  }
  return (
    <Link href={Routes.ShowItemPage({ itemId: item.id })}>
      <Card raised className='search-card'>
        <CardMedia image={mainImage} title={mainImage} />
        <CardContent>
          <Typography gutterBottom variant='h5' component='div'>
            {item.name}
          </Typography>
          <Typography variant='body2' color='text.secondary' noWrap>
            {item.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size='small'>See more</Button>
        </CardActions>
      </Card>
    </Link>
  );
};

const Home: BlitzPage = () => {
  const router = useContext(RouterContext);
  const [marginTopProp, setMarginTopProp] = useState<{ marginTop?: string }>({});
  const search = useSearch();

  const initialData = {
    expression: '',
    items: [],
    pages: 0,
    currentPage: Number(router.query.page) || 1
  };

  const [data, setData] = useState<IData>({ ...initialData });

  const adjustSearchFieldMarginTop = () => {
    if (data.items.length === 0) {
      setMarginTopProp({ marginTop: calculateMarginTop() });
    } else {
      setMarginTopProp({ marginTop: '0px' });
    }
  };

  useEffect(() => {
    adjustSearchFieldMarginTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items]);

  useEffect(() => {
    if (router.query.expression && router.query.expression !== data.expression) {
      const expression = String(router.query.expression);
      setData({ ...data, expression });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.expression]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanSearch = () => {
    setData({ ...initialData });
    void router.push({});
  };

  const handleSearch = async (expression: string, page: number) => {
    const { items, count } = await search(expression, page - 1);
    setData({
      items,
      pages: Math.ceil(count / 9),
      expression,
      currentPage: page
    });
  };

  const renderCards = useMemo(
    () =>
      data.items.map((item) => (
        <Grid item key={getSimpleRandomKey()}>
          <ItemCard item={item as ItemWithFiles} />
        </Grid>
      )),
    [data.items]
  );
  return (
    <Layout title='Home'>
      <Head>
        <title>Papermodels</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Container component='main'>
          <Grid container spacing={3}>
            <Grid item container justifyContent='center'>
              <Grid item>Papermodels</Grid>
            </Grid>
            <Grid
              item
              container
              justifyContent='center'
              style={{ ...marginTopProp, display: marginTopProp.marginTop ? '' : 'none' }}>
              <Grid item container lg={8} md={8} sm={10} xs={12} alignItems='center' spacing='3'>
                <Grid item xs={11}>
                  <TextField
                    margin='normal'
                    fullWidth
                    label='Search on Papermodels'
                    name='searchModel'
                    autoFocus
                    hidden={true}
                    value={data.expression}
                    onChange={(event) => setData({ ...data, expression: event.target.value })}
                    onKeyPress={(ev) => {
                      if (ev.key === 'Enter') {
                        void handleSearch(data.expression, 1);
                        ev.preventDefault();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={cleanSearch} title='Clean'>
                            <MdClose />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button onClick={() => handleSearch(data.expression, 1)} variant='contained' size='large'>
                    <MdSearch title='Search' />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container justifyContent='center' spacing={3}>
              {renderCards}
            </Grid>
            <Grid item container justifyContent='center' spacing={3} className={data.pages === 0 ? 'hidden' : ''}>
              <Grid item container xs={12} justifyContent='center'>
                <Pagination
                  count={data.pages}
                  page={data.currentPage}
                  onChange={(_event, page) => handleSearch(data.expression, page)}
                />
              </Grid>
              <Grid item container xs={12} justifyContent='center'>
                <Typography>Total pages: {data.pages}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
