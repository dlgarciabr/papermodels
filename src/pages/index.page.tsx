import Layout from 'src/core/layouts/Layout';
import { BlitzPage } from '@blitzjs/next';
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
import { useEffect, useState } from 'react';
import { getSimpleRandomKey } from 'src/utils/global';
import { calculateMarginTop } from './index.utils';
import { useHandleSearch } from './index.hooks';

const theme = createTheme();

const SearchCard = () => {
  return (
    <Card sx={{ maxWidth: 345 }} raised>
      <CardMedia sx={{ height: 140 }} image='/contemplative-reptile.jpg' title='green iguana' />
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          Lizard
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging across all continents
          except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>Share</Button>
        <Button size='small'>Learn More</Button>
      </CardActions>
    </Card>
  );
};

const Home: BlitzPage = () => {
  const [marginTopProp, setMarginTopProp] = useState<{ marginTop?: string }>({});
  const [items, setItems] = useState([]);
  const [searchExpression, setSearchExpression] = useState<string>('');
  const handleSearch = useHandleSearch(setItems);

  useEffect(() => {
    if (items.length === 0) {
      setInitialSearchFieldMarginTop();
    } else {
      setMarginTopProp({ marginTop: '0px' });
    }
  }, [items]);

  useEffect(() => {
    setMarginTopProp({ marginTop: calculateMarginTop() });
  }, []);

  const cleanSearch = () => {
    setSearchExpression('');
    setInitialSearchFieldMarginTop();
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
                  value={searchExpression}
                  onChange={(event) => setSearchExpression(event.target.value)}
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
                <Button onClick={handleSearch} variant='contained' size='large'>
                  <MdSearch />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container justifyContent='center' spacing={3}>
            {items.map((_item) => (
              <Grid item key={getSimpleRandomKey()}>
                <SearchCard />
              </Grid>
            ))}
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
