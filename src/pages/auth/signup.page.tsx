/* istanbul ignore file -- @preserve */
// TODO remove ignore and improve coverage
import { useRouter } from 'next/router';
import Layout from 'src/core/layouts/Layout';
import { SignupForm } from 'src/auth/components/SignupForm.page';
import { BlitzPage, Routes } from '@blitzjs/next';

const SignupPage: BlitzPage = () => {
  const router = useRouter();

  return (
    <Layout title='Sign Up'>
      <SignupForm onSuccess={() => router.push(Routes.AdminPage())} />
    </Layout>
  );
};

export default SignupPage;
