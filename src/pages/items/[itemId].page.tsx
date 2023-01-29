/* eslint-disable @next/next/no-img-element */
import { Suspense, useContext, useEffect, useState } from 'react';
import { RouterContext } from '@blitzjs/next';
import Head from 'next/head';
import { useQuery } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import getItemAnonymous from 'src/items/queries/getItemAnonymous';
import { Button, CircularProgress, Container, Grid, Paper, Rating, Typography } from '@mui/material';
import { FileType, Item as IItem, ItemFile as IItemFile } from 'db';
import { MdDownload } from 'react-icons/md';
import { IImageData, IThumbnailsData } from './types';
import { getFilePath } from 'src/utils/fileStorage';
import Thumbnail from 'src/core/components/Thumbnail';
import { getSimpleRandomKey } from 'src/utils/global';

const renderContentAndUrlRow = (label: string, name: string | null, url: string | null) => {
  const renderAuthorContent = () => {
    if (name && url) {
      return (
        <a href={url} target='blank'>
          {name}
        </a>
      );
    } else if (name && !url) {
      return name;
    } else if (!name && url) {
      return (
        <a href={url} target='blank'>
          {url}
        </a>
      );
    }
  };
  return (
    (name || url) && (
      <tr>
        <td>
          <Typography variant='body2'>{label}</Typography>
        </td>
        <td>
          <Typography variant='body2'>{renderAuthorContent()}</Typography>
        </td>
      </tr>
    )
  );
};

const DetailsTable = ({ item }: { item: IItem & { files: IItemFile[] } }) => {
  const assemblyTime = Number(item.assemblyTime);
  return (
    <Grid container item xs={12}>
      <table className='width100pc content-info'>
        <thead>
          <tr>
            <td colSpan={2}>
              <Typography variant='subtitle2'>Content information</Typography>
            </td>
          </tr>
        </thead>
        <tbody>
          {renderContentAndUrlRow('Author', item.author, item.authorLink)}
          <tr>
            <td>
              <Typography variant='body2'>Approx. assembly time</Typography>
            </td>
            <td>
              <Typography variant='body2'>
                {assemblyTime}
                {assemblyTime <= 1 ? 'h' : 'hs'}
              </Typography>
            </td>
          </tr>
          <tr>
            <td className='width30pc'>
              <Typography variant='body2'>Dificulty</Typography>
            </td>
            <td>
              <Rating className='assembly-dificulty' readOnly name='simple-controlled' value={item.dificulty} />
            </td>
          </tr>
          {renderContentAndUrlRow('License', item.licenseType, item.licenseTypeLink)}
        </tbody>
      </table>
    </Grid>
  );
};

export const Item = () => {
  const itemId = useParam('itemId', 'number');
  const [item] = useQuery(getItemAnonymous, { id: itemId });
  const [imageData, setImageData] = useState<IImageData>({
    loading: false
  });
  const [thumbnailsData, setThumbnailsData] = useState<IThumbnailsData>({
    loading: false,
    items: []
  });
  // TODO if item is null redirect to home

  const setupThumbnails = () => {
    const thumbnails = item.files
      .filter((file) => file.artifactType === FileType.thumbnail)
      .map((file) => ({
        storagePath: file.storagePath
      }));
    setThumbnailsData({
      loading: true,
      items: thumbnails
    });
  };

  const loadMainImage = async (storagePath: string) => {
    setImageData({ loading: true });
    const url = await getFilePath(storagePath);
    const response = await fetch(url, { method: 'GET' });
    const blob = await response.blob();
    const urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    setImageData({
      loading: false,
      url: imageUrl,
      name: storagePath
    });
  };

  const loadMainImageFromThumbnail = async (thumbnailIndex: number) => {
    const storagePathParts = thumbnailsData.items[thumbnailIndex]?.storagePath.split('.');
    const imageName = storagePathParts![0]?.replaceAll('_thumb', '');
    const extension = storagePathParts![1];
    const imageStoragePath = `${imageName}.${extension}`;
    if (imageData.name === imageStoragePath) {
      return;
    }
    await loadMainImage(imageStoragePath);
  };

  useEffect(() => {
    setupThumbnails();
    void (async () => {
      const previewFiles = item.files.filter((file) => file.artifactType === FileType.preview);
      if (!imageData.url && previewFiles.length >= 1) {
        const file = previewFiles[0];
        await loadMainImage(file!.storagePath);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (thumbnailsData.items.length > 0) {
      void loadThumbnailUrls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailsData.items]);

  const loadThumbnailUrls = async () => {
    for await (const item of thumbnailsData.items) {
      const url = await getFilePath(item.storagePath);
      item.finalUrl = url;
      setThumbnailsData({
        ...thumbnailsData,
        items: thumbnailsData.items
      });
    }
    setThumbnailsData({
      ...thumbnailsData,
      loading: false
    });
  };

  const thumbnails = () =>
    thumbnailsData.items.map((item, index) => (
      <Thumbnail
        key={getSimpleRandomKey()}
        index={index}
        loading={!item.finalUrl}
        src={item.finalUrl}
        altText={item.storagePath}
        onClick={loadMainImageFromThumbnail}
      />
    ));

  return (
    <>
      <Head>
        <title>Papermodels - {item.name}</title>
      </Head>
      <Container component='main'>
        <Grid container>
          <Grid container item spacing={1}>
            <Grid item container xs={6}>
              <Grid item xs={12}>
                <Paper variant='outlined' elevation={0} className='item-main-image'>
                  <Grid container justifyContent='center' alignContent='center' sx={{ height: '100%' }}>
                    <Grid item>
                      {imageData.loading && <CircularProgress />}
                      <img className={imageData.loading ? 'hidden' : ''} src={imageData.url} alt={imageData.name} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item container xs={12}>
                {thumbnails()}
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
              <Grid item container xs={12}>
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
