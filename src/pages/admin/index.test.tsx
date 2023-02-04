import { expect, vi } from 'vitest';

import { render } from 'test/utils';
import Home from './index.page';

test('Admin page is rendered', () => {
  // arrange
  vi.mock('src/users/hooks/useCurrentUser', () => ({
    useCurrentUser: () => ({
      id: 1,
      name: 'User',
      email: 'user@email.com',
      role: 'user'
    })
  }));

  // act
  const result = render(<Home />);

  // assert
  expect(result.baseElement).toMatchSnapshot();
});

test.todo('User click on logout buton');

test.todo('User click on login buton');
