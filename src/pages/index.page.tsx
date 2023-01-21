import Layout from 'src/core/layouts/Layout';
import { BlitzPage } from '@blitzjs/next';
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, IconButton, InputAdornment, TextField, Grid } from '@mui/material';
import { MdSearch } from 'react-icons/md';
import { useEffect, useState } from 'react';

const theme = createTheme();

const Home: BlitzPage = () => {
  const [marginTopProp, setMarginTopProp] = useState<{ marginTop?: string }>({});

  useEffect(() => {
    const marginTop = `${window.innerHeight / 3}px`;
    setMarginTopProp({ marginTop });
  }, []);

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
          <Grid container justifyContent='center'>
            <Grid
              item
              lg={8}
              md={8}
              sm={10}
              xs={12}
              style={{ ...marginTopProp, display: marginTopProp.marginTop ? '' : 'none' }}>
              <TextField
                margin='normal'
                fullWidth
                label='Search on Papermodels'
                name='searchModel'
                autoFocus
                hidden={true}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='search icon'
                        // onClick={handleClickShowPassword}
                        // onMouseDown={handleMouseDownPassword}
                      >
                        <MdSearch />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
