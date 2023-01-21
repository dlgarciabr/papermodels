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
import { useContext, useEffect, useState } from 'react';
import { getSimpleRandomKey } from 'src/utils/global';
import { calculateMarginTop } from './index.utils';
import { useHandleSearch } from './index.hooks';
import { Item } from 'db';

const theme = createTheme();

const SearchCard = ({ item }: { item: Item }) => {
  return (
    <Card raised className='search-card'>
      <CardMedia image='/contemplative-reptile.jpg' title='green iguana' />
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
  const handleSearch = useHandleSearch(setItems);

  useEffect(() => {
    if (items.length === 0) {
      setInitialSearchFieldMarginTop();
    } else {
      setMarginTopProp({ marginTop: '0px' });
    }
  }, [items]);

  useEffect(() => {
    const queryExpression = String(router.query.expression);
    if (queryExpression) {
      setExpression(queryExpression);
      setInitialSearchFieldMarginTop();
    } else {
      setMarginTopProp({ marginTop: calculateMarginTop() });
    }
  }, [router.query.expression]);

  const cleanSearch = () => {
    setExpression('');
    setItems([]);
  };

  const setInitialSearchFieldMarginTop = () => {
    setMarginTopProp({ marginTop: calculateMarginTop() });
  };

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
                  // onKeyDown={event => { if (event.key === '13') { console.log(event.key); handleSearch(); } }}
                  inputProps={
                    {
                      // onKeyDown: event => { if (event.key === '13') { console.log(event.key); handleSearch(); } }
                    }
                  }
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
                <Button onClick={() => handleSearch(expression, page)} variant='contained' size='large'>
                  <MdSearch />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container justifyContent='center' spacing={3}>
            {items.map((item) => (
              <Grid item key={getSimpleRandomKey()}>
                <SearchCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
