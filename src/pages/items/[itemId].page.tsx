import { Suspense, useContext } from 'react';
import { RouterContext } from '@blitzjs/next';
import Head from 'next/head';
import { useQuery } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import getItemAnonymous from 'src/items/queries/getItemAnonymous';
import { Button, Container, Grid, Paper, Typography } from '@mui/material';
import { Item as IItem, ItemFile as IItemFile } from 'db';
import { MdDownload } from 'react-icons/md';

const renderLicenseRow = (licenseType: string | null, licenseTypeLink: string | null) => {
  const renderLicenseContent = () => {
    if (licenseType && licenseTypeLink) {
      return (
        <a href={licenseTypeLink} target='blank'>
          {licenseType}
        </a>
      );
    } else if (licenseType && !licenseTypeLink) {
      return licenseType;
    } else if (!licenseType && licenseTypeLink) {
      return (
        <a href={licenseTypeLink} target='blank'>
          {licenseTypeLink}
        </a>
      );
    }
  };

  return (
    (licenseType || licenseTypeLink) && (
      <tr>
        <td>License</td>
        <td>{renderLicenseContent()}</td>
      </tr>
    )
  );
};

const DetailsTable = ({ item }: { item: IItem & { files: IItemFile[] } }) => {
  return (
    <table>
      <thead>
        <tr>
          <td colSpan={2}>info</td>
        </tr>
      </thead>
      <tbody>
        {item.author && (
          <tr>
            <td>Author</td>
            <td>{item.author}</td>
          </tr>
        )}
        {item.authorLink && (
          <tr>
            <td>Author URL</td>
            <td>{item.authorLink}</td>
          </tr>
        )}
        <tr>
          <td>Dificulty</td>
          <td>{item.dificulty}</td>
        </tr>
        <tr>
          <td>Approx. assembly time</td>
          <td>{Number(item.assemblyTime)}</td>
        </tr>
        {renderLicenseRow(item.licenseType, item.licenseTypeLink)}
      </tbody>
    </table>
  );
};

export const Item = () => {
  const itemId = useParam('itemId', 'number');
  const [item] = useQuery(getItemAnonymous, { id: itemId });

  return (
    <>
      <Head>
        <title>Item {item.id}</title>
      </Head>
      <Container component='main'>
        <Grid container>
          <Grid container item>
            <Grid item container xs={6}>
              <Grid item xs={12}>
                full image
              </Grid>
              <Grid item xs={12}>
                small images
              </Grid>
            </Grid>
            <Grid item container xs={6} spacing={2}>
              <Grid item xs={12}>
                <Typography variant='h6' component='div'>
                  {item.name}
                </Typography>
                {item.description && <Typography variant='subtitle1'>{item.description}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Paper className='item-download' elevation={0}>
                  <Grid container spacing={2} justifyContent='center'>
                    <Grid item xs={10}>
                      <Button variant='contained' fullWidth startIcon={<MdDownload />}>
                        Download scheme
                      </Button>
                    </Grid>
                    <Grid item xs={10}>
                      <Button variant='contained' fullWidth startIcon={<MdDownload />}>
                        Download instrunctions
                      </Button>
                    </Grid>
                    <Grid item xs={10}>
                      <Button variant='contained' fullWidth startIcon={<MdDownload />} color='secondary'>
                        Download all
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <DetailsTable item={item} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const ShowItemPage = () => {
  const router = useContext(RouterContext);
  return (
    <div>
      <p>
        <a href='#' onClick={() => router.back()}>
          Home
        </a>
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <Item />
      </Suspense>
    </div>
  );
};

ShowItemPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowItemPage;
