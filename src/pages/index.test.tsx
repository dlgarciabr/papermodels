import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'test/ariaRoles';
import { render, screen } from 'test/utils';
import Home from './index.page';

describe('Index page tests', () => {
  test('Index page is rendered', () => {
    // arrange

    // act
    const result = render(<Home />);

    // assert
    expect(result.baseElement).toMatchSnapshot();
  });

  test('User search for a model pressing a search button and see results', async () => {
    // arrange
    const textToSearch = 'Trains';

    render(<Home />);

    // act
    const searchInputField = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, { name: 'Search on papermodels' });
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search' });

    await userEvent.type(searchInputField, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test.todo('User search for a model pressing enter and see results', async () => {
    // arrange

    render(<Home />);

    // act

    // user fill the input field clicks on search button

    // assert

    // a set of items are shown bellow the button
  });

  test.todo('User search for a model and see no results');

  test.todo('User search for a specific model and navigate to see the chosen model');
});
