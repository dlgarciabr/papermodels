import { FileType } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadItemFile } from 'src/items/types';
import { getSimpleRandomKey } from 'src/utils/global';
import FileThumbnail from './FileThumbnail';
import { DropzoneProps } from './types';

export const Dropzone = (props: DropzoneProps) => {
  const [dropedFiles, setDropedFiles] = useState<UploadItemFile[]>([]);

  const onDrop = (acceptedFiles: UploadItemFile[]) => {
    const filesToAdd = acceptedFiles.map((file) => {
      file.tempId = getSimpleRandomKey();
      if (file.type.indexOf('image') >= 0) {
        file.uploadPreview = URL.createObjectURL(file);
      }
      return file;
    });

    const newFileList = [...filesToAdd, ...dropedFiles];
    setDropedFiles(newFileList);
    if (props.onDropedFilesChange) {
      props.onDropedFilesChange(newFileList);
    }
    if (props.onDrop) {
      props.onDrop(filesToAdd);
    }
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, fileRejections } = useDropzone({
    ...props,
    onDrop
  });

  // TODO remove after defined styling method
  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };

  // TODO remove after defined styling method
  const focusedStyle = {
    borderColor: '#2196f3'
  };

  // TODO remove after defined styling method
  const acceptStyle = {
    borderColor: '#00e676'
  };

  // TODO remove after defined styling method
  const rejectStyle = {
    borderColor: '#ff1744'
  };

  // TODO remove after defined styling method
  const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFocused, isDragAccept, isDragReject]
  );

  const renderRejections = () => {
    if (fileRejections.length > 0) {
      return fileRejections.map((rejection) => {
        return (
          <>
            <p key={rejection.file.name}>{rejection.file.name}</p>
            <ul>
              {rejection.errors.map((error) => (
                <li key={error.code}>{error.message}</li>
              ))}
            </ul>
          </>
        );
      });
    }
  };

  const removeFileFromUploadList = (tempId) => {
    const newDropedFiles = dropedFiles.filter((file) => file.tempId !== tempId);
    setDropedFiles(newDropedFiles);
    if (props.onDropedFilesChange) {
      props.onDropedFilesChange(newDropedFiles);
    }
  };

  const handleClickRadioType = (fileId: string, artifactType: FileType) => {
    const files = [...dropedFiles];
    const file = files.find((file) => file.tempId === fileId) as UploadItemFile;
    file.artifactType = artifactType;
    setDropedFiles(files);
  };

  const renderThumbs = useMemo(
    () =>
      dropedFiles.map((file: UploadItemFile) => (
        <FileThumbnail
          key={getSimpleRandomKey()}
          file={file}
          onClickRadioType={handleClickRadioType}
          onClickRemove={removeFileFromUploadList}
          validationEnable={props.validateFiles}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropedFiles, props.validateFiles]
  );

  return (
    <section className='container'>
      <div {...getRootProps({ className: 'dropzone', style: style as any })}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
        <em>(2 files are the maximum number of files you can drop here)</em>
      </div>
      <aside style={thumbsContainer as any}>{renderThumbs}</aside>
      {renderRejections()}
    </section>
  );
};

export default Dropzone;
