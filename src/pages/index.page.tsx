import Layout from 'src/core/layouts/Layout';
import { BlitzPage, RouterContext } from '@blitzjs/next';
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
  Button
} from '@mui/material';
import { MdClose, MdSearch } from 'react-icons/md';
import { useContext, useEffect, useMemo, useState } from 'react';
import { getSimpleRandomKey } from 'src/utils/global';
import { calculateMarginTop } from './index.utils';
import { Item, ItemFile } from 'db';
import { useSearch } from './index.hooks';

const theme = createTheme();

const SearchCard = ({ item }: { item: Item & { files: ItemFile[] } }) => {
  let thumbnailUrl = 'empty';
  if (item.files.length > 0) {
    thumbnailUrl = item.files[0]?.storagePath as string;
  }
  return (
    <Card raised className='search-card'>
      <CardMedia image={thumbnailUrl} title='green iguana' />
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          {item.name}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {item.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>See more</Button>
      </CardActions>
    </Card>
  );
};

const Home: BlitzPage = () => {
  const router = useContext(RouterContext);
  const [marginTopProp, setMarginTopProp] = useState<{ marginTop?: string }>({});
  const page = Number(router.query.page) || 0;
  const [items, setItems] = useState<Item[]>([]);
  const [expression, setExpression] = useState<string>('');
  const search = useSearch(setItems);

  const adjustSearchFieldMarginTop = () => {
    if (items.length === 0) {
      setMarginTopProp({ marginTop: calculateMarginTop() });
    } else {
      setMarginTopProp({ marginTop: '0px' });
    }
  };

  useEffect(() => {
    adjustSearchFieldMarginTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    if (router.query.expression && router.query.expression !== expression) {
      const newExpression = String(router.query.expression);
      setExpression(newExpression);
      void search(newExpression, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.expression]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanSearch = () => {
    setExpression('');
    setItems([]);
  };

  const renderCards = useMemo(
    () =>
      items.map((item) => (
        <Grid item key={getSimpleRandomKey()}>
          <SearchCard item={item as Item & { files: ItemFile[] }} />
        </Grid>
      )),
    [items]
  );

  return (
    <Layout title='Home'>
      <Head>
        <title>Papermodels</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Container component='main'>
          <Grid container justifyContent='center'>
            <Grid item>Papermodels</Grid>
          </Grid>
          <Grid
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
                  value={expression}
                  onChange={(event) => setExpression(event.target.value)}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      void search(expression, page);
                      ev.preventDefault();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton aria-label='clean icon' onClick={cleanSearch}>
                          <MdClose />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <Button onClick={() => search(expression, page)} variant='contained' size='large'>
                  <MdSearch />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container justifyContent='center' spacing={3}>
            {renderCards}
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
