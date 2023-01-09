import { expect, vi } from 'vitest';

import { render, screen, fireEvent, waitFor, act } from 'test/utils';

import { ARIA_ROLE } from 'test/ariaRoles';
import Dropzone from '.';
import { DropzoneProps } from './types';

describe('Dropzone', () => {
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

  test('User drops an image file', async () => {
    // arrange
    const onDragEnter = vi.fn();
    const onDrop = vi.fn();

    const dropzoneOptions: DropzoneProps = {
      maxFiles: 5,
      accept: {
        'image/png': ['.png'],
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/svg+xml': ['.svg'],
        'application/pdf': ['.pdf']
      },
      onDragEnter,
      onDrop
    };

    const file = new File([JSON.stringify({ ping: true })], 'test.png', { type: 'image/png' });
    // ], 'test.zip', { type: 'application/zip' });

    const files = mockData([file]);

    render(<Dropzone {...dropzoneOptions} />);

    // act
    const dropzoneContainer = screen.getByText('Drag and drop some files here, or click to select files')
      .parentElement as Element;

    // fireEvent.dragEnter(
    //   dropzoneContainer,
    //   files
    // );
    await act(() =>
      fireEvent.dragEnter(
        dropzoneContainer,
        // container.querySelector('div') as HTMLDivElement,
        files
      )
    );
    // await act(
    //   () => fireEvent.dragEnter(
    //     dropzoneContainer,
    //     // container.querySelector('div') as HTMLDivElement,
    //     files,
    //   )
    // );

    // assert
    // expect(onDrop).toHaveBeenCalled();

    await waitFor(async () => {
      expect(onDrop).toHaveBeenCalled();
      // expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'test.png' })).toBeInTheDocument();
    });
  });

  test.todo('User add a pdf file to an item', async () => {});

  test.todo('User remove a file from an item', async () => {});

  test.todo('User delete an item');
});
