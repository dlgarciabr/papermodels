import Head from 'next/head';
import Layout from 'src/core/layouts/Layout';
import { listAllImages } from 'src/utils/firebaseStorage';

const FirebasepocPage = () => {
  void listAllImages();

  return (
    <Layout>
      <Head>
        <title>Firebasepoc</title>
      </Head>
      asdasd
    </Layout>
  );
};

export default FirebasepocPage;
