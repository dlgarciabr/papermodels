import { FileType } from '@prisma/client';
import { expect, vi } from 'vitest';
import { getFileUrl } from './fileStorage';
import { downloadFile, getFileTypeByText } from './global';

describe('Global Util', () => {
  test('downloadFile', async () => {
    // arrange
    const blobUrl = 'blob:http://127.0.0.1/550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(getFileUrl).mockResolvedValueOnce('url');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        blob: () => {}
      })
    ) as any;

    window.URL.createObjectURL = vi.fn(() => blobUrl) as any;

    const documentChanges: MutationRecord[] = [];

    const dom_observer = new MutationObserver((mutation) => {
      mutation.forEach((record: MutationRecord) => documentChanges.push(record));
    });

    dom_observer.observe(document.body, { attributes: true, childList: true, characterData: true });

    // act
    await downloadFile({ id: 'test', url: 'http://127.0.0.1' } as any);

    // assert
    expect((documentChanges[0]?.addedNodes[0] as HTMLAnchorElement).href).contains(blobUrl);
    expect((documentChanges[1]?.removedNodes[0] as HTMLAnchorElement).href).contains(blobUrl);
  });

  test('Should resolve FileType by text', async () => {
    // arrange
    const fileType = FileType.thumbnail;
    const fileTypeName = fileType.toString();

    // act
    const resultFileType = getFileTypeByText(fileTypeName);

    // assert
    expect(resultFileType).toBe(fileType);
  });
});
