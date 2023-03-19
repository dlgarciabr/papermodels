/* eslint-disable @next/next/no-img-element */
import { Suspense, useContext, useEffect, useState } from 'react';
import { RouterContext, Routes, useParam } from '@blitzjs/next';
import Head from 'next/head';

import Layout from 'src/core/layouts/Layout';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Rating,
  Typography
} from '@mui/material';
import { FileType } from 'db';
import { MdDownload } from 'react-icons/md';
import Image from 'next/image';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { invoke } from '@blitzjs/rpc';

import { IImageData, IThumbnail, IThumbnailsData } from './types';
import { getFileUrl, getPdfThumbnailUrl, getThumbnailUrl } from 'src/utils/fileStorage';
import Thumbnail from 'src/core/components/Thumbnail';
import { getSimpleRandomKey } from 'src/utils/global';
import { ItemWithChildren } from 'types';
import getItemAnonymous from 'src/items/queries/getItemAnonymous';
import { useDownloadFiles, useHasFileType } from './items.hook';
import logo2 from 'public/images/logo2.png';
import { shortenTextWithEllipsis } from 'src/utils/string';
import { LoadingButton } from '@mui/lab';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';

const renderContentAndUrlRow = (label: string, name: string | null, url: string | null) => {
  const renderAuthorContent = () => {
    /* istanbul ignore else -- @preserve */
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

const DetailsTable = ({ item }: { item: ItemWithChildren }) => {
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
              <Typography variant='body2'>Assembly time</Typography>
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
  const router = useContext(RouterContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [item, setItem] = useState<ItemWithChildren>();
  const hasFileType = useHasFileType();
  const [isDownloadingFile, setDownloadingFile] = useState<boolean>(false);

  const [mainImageData, setMainImageData] = useState<IImageData>({
    loading: false
  });
  const [thumbnailsData, setThumbnailsData] = useState<IThumbnailsData>({
    loading: false,
    items: []
  });

  const downloadFiles = useDownloadFiles(item);

  const setupThumbnails = (item: ItemWithChildren) => {
    const thumbnails: IThumbnail[] = item.files
      .filter((file) => file.artifactType === FileType.preview)
      .map((file) => ({
        type: FileType.preview,
        storagePath: file.storagePath
      }));
    if (thumbnails.length === 0) {
      const schemeFile = item.files.find((file) => file.artifactType === FileType.scheme);
      thumbnails.push({
        type: FileType.scheme,
        storagePath: schemeFile?.storagePath!
      });
    }
    setThumbnailsData({
      loading: true,
      items: thumbnails
    });
  };

  const loadMainImage = async (storagePath: string, type: FileType) => {
    setMainImageData({ loading: true });
    let url: string | null = getFileUrl(storagePath);
    if (type === FileType.scheme) {
      url = getPdfThumbnailUrl(url);
    }
    if (url && url !== '') {
      const response = await fetch(url, { method: 'GET' });
      const blob = await response.blob();
      const urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(blob);
      setMainImageData({
        loading: false,
        url: imageUrl,
        name: storagePath
      });
    }
  };

  const renderDescriptionDialog = () => {
    return (
      <Dialog open={openDescriptionDialog} onClose={() => setOpenDescriptionDialog(false)}>
        <DialogTitle>{item?.name}</DialogTitle>
        <DialogContent>
          <Box
            noValidate
            component='form'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'fit-content'
            }}>
            <Typography>{item?.description}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDescriptionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  /* istanbul ignore next -- @preserve */
  const loadMainImageFromThumbnail = async (thumbnailIndex: number) => {
    const thumbnail = thumbnailsData.items[thumbnailIndex]!;
    const storagePathParts = thumbnail.storagePath.split('.');
    const imageName = storagePathParts![0]?.replaceAll('_thumb', '');
    const extension = storagePathParts![1];
    const imageStoragePath = `${imageName}.${extension}`;
    if (mainImageData.name === imageStoragePath) {
      return;
    }
    await loadMainImage(imageStoragePath, thumbnail.type);
  };

  useEffect(() => {
    if (executeRecaptcha) {
      void (async () => {
        try {
          const gRecaptchaToken = await executeRecaptcha('viewItem');
          const item = await invoke(getItemAnonymous, {
            gRecaptchaToken,
            id: itemId
          });
          setItem(item as ItemWithChildren);
          if (item.files.length > 0) {
            setupThumbnails(item as ItemWithChildren);
            const previewFiles = item.files.filter((file) => file.artifactType === FileType.preview);
            if (!mainImageData.url && previewFiles.length >= 1) {
              const file = previewFiles[0];
              await loadMainImage(file!.storagePath, FileType.preview);
            } else {
              const file = item.files.find((file) => file.artifactType === FileType.scheme);
              const url = getPdfThumbnailUrl(file!.storagePath);
              if (url) {
                await loadMainImage(url, FileType.scheme);
              }
            }
          }
        } catch (error) {
          console.error(error);
          showToast(ToastType.ERROR, 'An error has ocurred, try again later.');
          void router.push(Routes.Home());
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, executeRecaptcha]);

  useEffect(() => {
    if (thumbnailsData.items.length > 0) {
      void loadThumbnailUrls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailsData.items]);

  const loadThumbnailUrls = async () => {
    thumbnailsData.items.forEach((thumbnail) => {
      let url = getThumbnailUrl(thumbnail.storagePath);
      if (thumbnail.type === FileType.scheme && !!url) {
        url = getPdfThumbnailUrl(url);
      }
      thumbnail.finalUrl = url || undefined;
      setThumbnailsData({
        ...thumbnailsData,
        items: thumbnailsData.items
      });
    });
    setThumbnailsData({
      ...thumbnailsData,
      loading: false
    });
  };

  const handleClickDownloadFile = async (artifactType: FileType) => {
    setDownloadingFile(true);
    await downloadFiles(artifactType);
    setDownloadingFile(false);
  };

  const thumbnails = () =>
    thumbnailsData.items.map((item, index) => (
      <Thumbnail
        key={getSimpleRandomKey()}
        index={index}
        loading={!item.finalUrl}
        src={item.finalUrl}
        altText={item.storagePath}
        onClick={(index) => (thumbnailsData.items.length > 1 ? loadMainImageFromThumbnail(index) : '')}
      />
    ));
  const title = `Papermodels - ${item?.name}`;
  return (
    <>
      {renderDescriptionDialog()}
      <Head>
        <title>{title}</title>
      </Head>
      <Container component='main'>
        <Grid container spacing={2} justifyContent='center'>
          <Grid item xs={12} className='justify-content-center'>
            <a href={process.env.NEXT_PUBLIC_SITE_URL}>
              <Image src={logo2.src} alt='papermodel' width='430px' height='100px' layout='fixed' className='logo' />
            </a>
          </Grid>
          {/* <Grid container item spacing={1}> */}
          <Grid item container xs={12} md={6}>
            <Grid item xs={12}>
              <Paper variant='outlined' elevation={0} className='item-main-image'>
                <Grid container justifyContent='center' alignContent='center' sx={{ height: '100%' }}>
                  <Grid item>
                    {mainImageData.loading && <CircularProgress />}
                    <img
                      className={mainImageData.loading ? 'hidden' : ''}
                      src={mainImageData.url}
                      alt={mainImageData.name}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item container xs={12}>
              {thumbnails()}
            </Grid>
          </Grid>
          <Grid item container xs={12} md={6} alignItems='flex-start' direction='row'>
            <Grid item container xs={12} md={12} rowSpacing={5} alignItems='flex-start' direction='row'>
              <Grid item xs={12}>
                <Typography variant='h6' component='div'>
                  {item?.name}
                </Typography>
                {item?.description && (
                  <Typography variant='subtitle1'>
                    {shortenTextWithEllipsis(item?.description, 200)}{' '}
                    {item?.description.length >= 200 && (
                      <a href='#' onClick={() => setOpenDescriptionDialog(true)}>
                        see more
                      </a>
                    )}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Paper className='download-buttons-container' elevation={0}>
                  <Grid container spacing={4} justifyContent='center'>
                    <Grid item xs={10}>
                      <LoadingButton
                        loading={isDownloadingFile}
                        variant='contained'
                        fullWidth
                        startIcon={<MdDownload />}
                        disabled={!item || !hasFileType(FileType.scheme, item?.files!)}
                        onClick={() => void handleClickDownloadFile(FileType.scheme)}>
                        Download schemes
                      </LoadingButton>
                    </Grid>
                    <Grid item xs={10}>
                      <LoadingButton
                        loading={isDownloadingFile}
                        variant='contained'
                        fullWidth
                        startIcon={<MdDownload />}
                        disabled={!item || !hasFileType(FileType.instruction, item?.files!)}
                        onClick={() => void handleClickDownloadFile(FileType.instruction)}>
                        Download instrunctions
                      </LoadingButton>
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
                {item && <DetailsTable item={item} />}
              </Grid>
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
