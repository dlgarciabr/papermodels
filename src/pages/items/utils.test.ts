import { vi } from 'vitest';
import { uploadFiles } from './utils';
import * as fileStorage from 'src/utils/fileStorage';
import { UploadItemFile } from 'src/items/types';

describe('uploadFiles', () => {
  test('uploads files and returns a list of uploaded files', async () => {
    //arrange
    const files = [{ tempId: '1' }] as UploadItemFile[];

    const mockSaveFile = vi.spyOn(fileStorage, 'saveFile').mockResolvedValue({
      public_id: 'adas',
      format: 'jpg'
    });

    //act
    const uploadedFiles = await uploadFiles(files);

    //assert
    expect(uploadedFiles).toEqual([
      {
        tempId: '1',
        storagePath: 'adas.jpg'
      }
    ]);
    expect(mockSaveFile).toHaveBeenCalledTimes(1);
    expect(mockSaveFile).toHaveBeenCalledWith({ tempId: '1' });
  });

  test('throws an error if saveFile returns an error', async () => {
    //arrange
    const files = [{ tempId: '1' }] as UploadItemFile[];

    vi.spyOn(fileStorage, 'saveFile').mockResolvedValue({});

    //act & assert
    await expect(() => uploadFiles(files)).rejects.toThrowError();
  });
});
