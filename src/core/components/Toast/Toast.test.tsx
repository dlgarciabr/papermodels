import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'src/utils/ariaRoles';
import { render, screen } from 'test/utils';
import { showToast } from '.';
import { ToastType } from './types.d';

describe('Toast component', () => {
  test('Displays success message', async () => {
    // arrange
    const message = 'Success message!';
    const buttonTitle = 'action button';
    const container = (
      <button
        onClick={() => {
          showToast(ToastType.SUCCESS, message);
        }}>
        {buttonTitle}
      </button>
    );

    render(container);

    // act
    const actionButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: buttonTitle }) as HTMLButtonElement;
    await userEvent.click(actionButton);

    // assert
    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  test('Displays error message', async () => {
    // arrange
    const message = 'Error message!';
    const buttonTitle = 'action button';
    const container = (
      <button
        onClick={() => {
          showToast(ToastType.ERROR, message);
        }}>
        {buttonTitle}
      </button>
    );

    render(container);

    // act
    const actionButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: buttonTitle }) as HTMLButtonElement;
    await userEvent.click(actionButton);

    // assert
    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
