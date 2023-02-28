import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from 'src/core/layouts/Layout';
import { useCurrentUser } from 'src/users/hooks/useCurrentUser';
import logout from 'src/auth/mutations/logout';
import logo from 'public/images/logo.png';
import { useMutation } from '@blitzjs/rpc';
import { Routes } from '@blitzjs/next';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import Loading from 'src/core/components/Loading';

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const currentUser = useCurrentUser();
  const [logoutMutation] = useMutation(logout);
  const router = useRouter();

  // TODO implement logout test
  /* istanbul ignore next -- @preserve */
  const handleLogout = async () => await logoutMutation();

  // TODO implement tests to cover all branches
  /* istanbul ignore else -- @preserve */
  if (currentUser) {
    return (
      <>
        <Button variant='contained' onClick={handleLogout}>
          Logout
        </Button>
        <div>Hello {currentUser.email}</div>
      </>
    );
  } else {
    return (
      <>
        <Button variant='contained' onClick={() => router.push(Routes.SignupPage())}>
          Sign Up
        </Button>
        <Button variant='contained' onClick={() => router.push(Routes.LoginPage())}>
          Login
        </Button>
      </>
    );
  }
};

const Admin = () => {
  const currentUser = useCurrentUser();
  return (
    <Layout title='Home'>
      <div className='container'>
        <main>
          <div className='logo'>
            <Image src={`${logo.src}`} alt='blitzjs' width='256px' height='160px' layout='fixed' />
          </div>
          <div className='buttons' style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <Suspense fallback='Loading...'>
              <UserInfo />
            </Suspense>
          </div>
          {currentUser && (
            <div>
              <p>
                <Link href='/categories'>
                  <a>categories</a>
                </Link>
              </p>
              <p>
                <Link href='/items'>
                  <a>items</a>
                </Link>
              </p>
              <p>
                <Link href='/admin/integration'>
                  <a>integration</a>
                </Link>
              </p>
            </div>
          )}
        </main>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;700&display=swap');

          html,
          body {
            padding: 0;
            margin: 0;
            font-family: 'Libre Franklin', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
              Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          }

          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            box-sizing: border-box;
          }
          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          main {
            padding: 5rem 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          main p {
            font-size: 1.2rem;
          }

          p {
            text-align: center;
          }

          footer {
            width: 100%;
            height: 60px;
            border-top: 1px solid #eaeaea;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #45009d;
          }

          footer a {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          footer a {
            color: #f4f4f4;
            text-decoration: none;
          }

          .logo {
            margin-bottom: 2rem;
          }

          .logo img {
            width: 300px;
          }

          .buttons {
            display: grid;
            grid-auto-flow: column;
            grid-gap: 0.5rem;
          }
          .button {
            font-size: 1rem;
            background-color: #6700eb;
            padding: 1rem 2rem;
            color: #f4f4f4;
            text-align: center;
          }

          .button.small {
            padding: 0.5rem 1rem;
          }

          .button:hover {
            background-color: #45009d;
          }

          .button-outline {
            border: 2px solid #6700eb;
            padding: 1rem 2rem;
            color: #6700eb;
            text-align: center;
          }

          .button-outline:hover {
            border-color: #45009d;
            color: #45009d;
          }

          pre {
            background: #fafafa;
            border-radius: 5px;
            padding: 0.75rem;
            text-align: center;
          }
          code {
            font-size: 0.9rem;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono,
              Courier New, monospace;
          }

          .grid {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;

            max-width: 800px;
            margin-top: 3rem;
          }

          @media (max-width: 600px) {
            .grid {
              width: 100%;
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

const AdminPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Admin />
      </Suspense>
      <p>
        <Link href={Routes.ItemsPage()}>
          <a>Back to List</a>
        </Link>
      </p>
    </div>
  );
};

export default AdminPage;
