/* eslint-disable @next/next/no-img-element */
import { Suspense, useContext, useEffect, useState } from 'react';
import { RouterContext, Routes, useParam } from '@blitzjs/next';
import Head from 'next/head';

import Layout from 'src/core/layouts/Layout';
import { Button, CircularProgress, Container, Grid, Paper, Rating, Typography } from '@mui/material';
import { FileType } from 'db';
import { MdDownload } from 'react-icons/md';
import Image from 'next/image';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { invoke } from '@blitzjs/rpc';

import { IImageData, IThumbnailsData } from './types';
import { getFileUrl, getThumbnailUrl } from 'src/utils/fileStorage';
import Thumbnail from 'src/core/components/Thumbnail';
import { getSimpleRandomKey } from 'src/utils/global';
import { ItemWithFiles } from 'types';
import getItemAnonymous from 'src/items/queries/getItemAnonymous';
import { useDownloadFiles } from './items.hook';
import logo from 'public/images/logo.png';

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

const DetailsTable = ({ item }: { item: ItemWithFiles }) => {
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
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useContext(RouterContext);

  const [itemWithFiles, setItemWithFiles] = useState<ItemWithFiles>();

  const [imageData, setImageData] = useState<IImageData>({
    loading: false
  });
  const [thumbnailsData, setThumbnailsData] = useState<IThumbnailsData>({
    loading: false,
    items: []
  });

  const downloadFiles = useDownloadFiles(itemWithFiles);

  const setupThumbnails = (item: ItemWithFiles) => {
    const thumbnails = item.files
      .filter((file) => file.artifactType === FileType.preview)
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
    const url = getFileUrl(storagePath);
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

  /* istanbul ignore next -- @preserve */
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
    if (executeRecaptcha) {
      void (async () => {
        const gRecaptchaToken = await executeRecaptcha('viewItem');
        const item = await invoke(getItemAnonymous, {
          gRecaptchaToken,
          id: itemId
        });
        setItemWithFiles(item);
        setupThumbnails(item);
        const previewFiles = item.files.filter((file) => file.artifactType === FileType.preview);
        if (!imageData.url && previewFiles.length >= 1) {
          const file = previewFiles[0];
          await loadMainImage(file!.storagePath);
        }
      })();
    }
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
      const url = getThumbnailUrl(item.storagePath);
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
        <title>Papermodels - {itemWithFiles?.name}</title>
      </Head>
      <Container component='main'>
        <Grid container spacing={2} justifyContent='center'>
          <Grid item xs={12} className='justify-content-center'>
            <Image
              src={`${logo.src}`}
              alt='blitzjs'
              width='256px'
              height='160px'
              layout='fixed'
              className='logo'
              onClick={() => router.push(Routes.Home())}
            />
          </Grid>
          {/* <Grid container item spacing={1}> */}
          <Grid item container xs={12} md={6}>
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
          <Grid item container xs={12} md={6} spacing={0} alignItems='flex-start' direction='row'>
            <Grid item xs={12}>
              <Typography variant='h6' component='div'>
                {itemWithFiles?.name}
              </Typography>
              {itemWithFiles?.description && <Typography variant='subtitle1'>{itemWithFiles?.description}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Paper className='item-download' elevation={0}>
                <Grid container spacing={2} justifyContent='center'>
                  <Grid item xs={10}>
                    <Button
                      variant='contained'
                      fullWidth
                      startIcon={<MdDownload />}
                      onClick={() => {
                        downloadFiles(FileType.scheme);
                      }}>
                      Download schemes
                    </Button>
                  </Grid>
                  <Grid item xs={10}>
                    <Button
                      variant='contained'
                      fullWidth
                      startIcon={<MdDownload />}
                      onClick={() => {
                        downloadFiles(FileType.instruction);
                      }}>
                      Download instrunctions
                    </Button>
                  </Grid>
                  {/* <Grid item xs={10}>
                      <Button variant='contained' fullWidth startIcon={<MdDownload />} color='secondary'>
                        Download all
                      </Button>
                    </Grid> */}
                </Grid>
              </Paper>
            </Grid>
            <Grid item container xs={12}>
              {itemWithFiles && <DetailsTable item={itemWithFiles} />}
            </Grid>
          </Grid>
          {/* </Grid> */}
        </Grid>
      </Container>
    </>
  );
};

const ShowItemPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Item />
      </Suspense>
    </div>
  );
};

ShowItemPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowItemPage;
