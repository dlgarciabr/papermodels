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
  Pagination,
  Alert,
  Collapse
} from '@mui/material';
import { MdClose, MdSearch } from 'react-icons/md';
import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { getSimpleRandomKey } from 'src/utils/global';
import { calculateMarginTop } from './index.utils';
import logo from 'public/images/logo.png';
import dog from 'public/images/dog.png';
import { useGetSugestions, useSearch } from './index.hooks';
import { IData } from './items/index.types';
import { ItemWithChildren } from 'types';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';
import { LoadingButton } from '@mui/lab';
import { FileType } from '@prisma/client';
import { getPdfThumbnailUrl } from 'src/utils/fileStorage';
import CategoryCarousel from 'src/core/components/CategoryCarousel';
import getCategoriesAnonymous from 'src/categories/queries/getCategoriesAnonymous';
import { invoke } from '@blitzjs/rpc';

const theme = createTheme();

const ItemCard = ({ item }: { item: ItemWithChildren }) => {
  let mainImage = dog.src;
  if (item.files.length > 0) {
    const hasPreviewImage = item.files.some((file) => file.artifactType === FileType.preview);
    if (hasPreviewImage) {
      const mainPreviewImage = item.files.find((file) => file.mainPreview);
      if (mainPreviewImage) {
        mainImage = mainPreviewImage.storagePath;
      } else {
        mainImage = item.files.filter((file) => file.artifactType === FileType.preview)[0]!.storagePath;
      }
    } else {
      const schemeUrl = item.files.filter((file) => file.artifactType === FileType.scheme)[0]?.storagePath!;
      const thumbnailUrl = getPdfThumbnailUrl(schemeUrl);
      if (thumbnailUrl) {
        mainImage = thumbnailUrl;
      }
    }
  }
  return (
    <Link href={Routes.ShowItemPage({ itemId: item.id })}>
      <Card raised className='search-card'>
        <CardMedia image={mainImage} title={mainImage} />
        <CardContent>
          <Typography gutterBottom variant='h5' component='div'>
            {item.name.length <= 66 ? item.name : item.name.substring(0, 63).concat('...')}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

const Home: BlitzPage = () => {
  const router = useContext(RouterContext);
  const [marginTopProp, setMarginTopProp] = useState<{ marginTop?: string }>({});
  const [showEmptySearchMessage, setShowEmptySearchMessage] = useState<boolean>(false);
  const [isEmptySearchAtempt, setEmptySearchAtempt] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const search = useSearch();
  const getSugestions = useGetSugestions();

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

  const loadCaterogies = async () => {
    const {
      default: { src }
    } = (await import('public/images/category_autos2.png')) as any;
    const images = [
      {
        categoryId: '',
        imageSrc: src
      }
    ];
    const { categories } = await invoke(getCategoriesAnonymous, {
      orderBy: { name: 'asc' }
    });
    setCategories(categories.map((category) => ({ ...category, imagePath: images[0]!.imageSrc })));
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
    void loadCaterogies();
  }, []);

  const cleanSearch = () => {
    setData({ ...initialData });
    void router.push({});
  };

  const handleSearch = async (expression: string, page: number) => {
    if (expression.trim() === '') {
      setEmptySearchAtempt(true);
      return;
    }
    setLoading(true);
    setEmptySearchAtempt(false);
    setShowEmptySearchMessage(false);
    try {
      const { items, count } = await search(expression, page - 1);
      setData({
        items,
        pages: Math.ceil(count / 9),
        expression,
        currentPage: page
      });
      if (items.length === 0) {
        const { items, count } = await getSugestions();
        setData({
          items,
          pages: Math.ceil(count / 9),
          expression,
          currentPage: page
        });
        setShowEmptySearchMessage(true);
      }
    } catch (error) {
      showToast(ToastType.ERROR, error);
    } finally {
      setLoading(false);
    }
  };

  const renderCards = useMemo(
    () =>
      data.items.map((item) => (
        <Grid item key={getSimpleRandomKey()}>
          <ItemCard item={item as ItemWithChildren} />
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
              <Grid item>
                <Image src={logo.src} alt='papermodel' width='256px' height='160px' layout='fixed' />
              </Grid>
            </Grid>
            <Grid
              item
              container
              justifyContent='center'
              style={{ ...marginTopProp, display: marginTopProp.marginTop ? '' : 'none' }}>
              <Grid item container lg={8} md={8} sm={10} xs={12} alignItems='flex-start' spacing='3'>
                <Grid item xs={12} className='height50px'>
                  <Collapse in={showEmptySearchMessage}>
                    <Alert severity='info' onClose={() => setShowEmptySearchMessage(false)}>
                      No results were found, showing some nice suggestions!
                    </Alert>
                  </Collapse>
                </Grid>
                <Grid item xs={11}>
                  <TextField
                    margin='dense'
                    fullWidth
                    error={isEmptySearchAtempt}
                    helperText={isEmptySearchAtempt ? 'Type something before search, like aircraft...' : ''}
                    label='Search for a model'
                    name='searchModel'
                    className='search-input'
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
                  <LoadingButton
                    loading={isLoading}
                    className='search-button'
                    onClick={() => handleSearch(data.expression, 1)}
                    variant='contained'
                    size='large'>
                    <MdSearch title='Search for a model' size='22' />
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container justifyContent='center' spacing={3}>
              {renderCards}
            </Grid>
            <Grid
              item
              container
              justifyContent='center'
              spacing={3}
              className={data.pages === 0 || showEmptySearchMessage ? 'hidden' : ''}>
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
            <Grid item xs={12} container justifyContent='center'>
              <CategoryCarousel categories={categories} loading={categories.length === 0} />
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </Layout>
  );
};

export default Home;
