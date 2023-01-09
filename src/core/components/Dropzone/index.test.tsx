import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen, fireEvent, waitFor, act } from 'test/utils';
import { ARIA_ROLE } from 'test/ariaRoles';
import Dropzone from '.';
import { DropzoneProps } from './types';
import { FileType } from 'db';

describe('Dropzone', () => {
  // global arrange
  const containerPlaceholder = 'Drag and drop some files here, or click to select files';

  const mockData = (files) => {
    return {
      dataTransfer: {
        files,
        items: files.map((file) => ({
          kind: 'file',
          type: file.type,
          getAsFile: () => file
        })),
        types: ['Files']
      }
    };
  };

  global.URL.createObjectURL = vi.fn().mockResolvedValueOnce('http://127.0.0.1');

  const globalOptions: DropzoneProps = {
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf']
    }
  };

  test('User drops an image file', async () => {
    // arrange
    const file = new File([], 'test.png', { type: 'image/png' });

    const files = mockData([file]);

    render(<Dropzone {...globalOptions} />);

    // act
    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    // assert
    await waitFor(async () => {
      expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'test.png' })).toBeInTheDocument();
    });
  });

  test('User drops an image file', async () => {
    // arrange
    const file = new File([], 'test.pdf', { type: 'application/pdf' });

    const files = mockData([file]);

    render(<Dropzone {...globalOptions} />);

    // act
    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    // assert
    await waitFor(async () => {
      expect(await screen.findByText('test.pdf')).toBeInTheDocument();
    });
  });

  test('User try to drop an invalid type file ', async () => {
    // arrange
    const file = new File([], 'test.zip', { type: 'application/zip' });

    const files = mockData([file]);

    render(<Dropzone {...globalOptions} />);

    // act
    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    // assert
    expect(
      screen.getByText('File type must be image/png,.png,image/jpeg,.jpeg,.jpg,image/svg+xml,.svg,application/pdf,.pdf')
    ).toBeInTheDocument();
  });

  test('User drops a file and extended handlers are called ', async () => {
    // arrange
    const onDropedFilesChange = vi.fn();
    const onDrop = vi.fn();
    const dropzoneOptions: DropzoneProps = {
      onDropedFilesChange,
      onDrop
    };

    const file = new File([], 'test.png', { type: 'image/png' });

    const files = mockData([file]);

    render(<Dropzone {...dropzoneOptions} />);

    // act
    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    // assert
    expect(onDropedFilesChange).toHaveBeenCalledOnce();
    expect(onDrop).toHaveBeenCalledOnce();
  });

  test('User drops a file and remove it', async () => {
    // arrange
    const file = new File([], 'test.png', { type: 'image/png' });
    const files = mockData([file]);
    const onDropedFilesChange = vi.fn();

    render(<Dropzone {...globalOptions} onDropedFilesChange={onDropedFilesChange} />);

    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    await waitFor(async () => {
      expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'test.png' })).toBeInTheDocument();
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'remove' }));

    // assert
    expect(screen.queryByText('file')).not.toBeInTheDocument();
    expect(onDropedFilesChange).toHaveBeenCalledTimes(2);
  });

  test('User drops a file and choose artifact radio type', async () => {
    // arrange
    const file = new File([], 'test.png', { type: 'image/png' });
    const files = mockData([file]);
    const onDropedFilesChange = vi.fn();

    render(<Dropzone {...globalOptions} onDropedFilesChange={onDropedFilesChange} />);

    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    await waitFor(async () => {
      expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'test.png' })).toBeInTheDocument();
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.instruction }));
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.preview }));
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.scheme }));

    // assert
    expect((screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.instruction }) as HTMLInputElement).checked).toBe(
      false
    );
    expect((screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.preview }) as HTMLInputElement).checked).toBe(
      false
    );
    expect((screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.scheme }) as HTMLInputElement).checked).toBe(
      true
    );
  });

  test('User drops a file and thumbnail error is activated', async () => {
    // arrange
    const file = new File([], 'test.png', { type: 'image/png' });
    const files = mockData([file]);

    let validateFiles = false;

    const { rerender } = render(<Dropzone {...globalOptions} validateFiles={validateFiles} />);

    const dropzoneContainer = screen.getByText(containerPlaceholder).parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, files));

    await waitFor(async () => {
      expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'test.png' })).toBeInTheDocument();
    });

    // act
    validateFiles = true;

    rerender(<Dropzone {...globalOptions} validateFiles={validateFiles} />);
    // assert

    const containsError = screen.getByText('test.png').closest('div.thumbnail')?.classList.contains('error');
    expect(containsError).toBe(true);
  });
});
