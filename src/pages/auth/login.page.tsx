/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import { BlitzPage, Routes } from '@blitzjs/next';
import Layout from 'src/core/layouts/Layout';
import { LoginForm } from 'src/auth/components/LoginForm.page';
import { useRouter } from 'next/router';

const LoginPage: BlitzPage = () => {
  const router = useRouter();

  return (
    <Layout title='Log In'>
      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next ? decodeURIComponent(router.query.next as string) : Routes.AdminPage();
          return router.push(next);
        }}
      />
    </Layout>
  );
};

export default LoginPage;
