import { render } from 'test/utils';
import Home from './index.page';

describe('Index page tests', () => {
  test('Index page is rendered', () => {
    // arrange

    // act
    const result = render(<Home />);

    // assert
    expect(result.baseElement).toMatchSnapshot();
  });

  test.todo('User search for a model and see results');

  test.todo('User search for a model and see no results');

  test.todo('User search for a specific model and navigate to see the chosen model');
});
