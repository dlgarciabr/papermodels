import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { FileType } from 'db';
import { memo, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadItemFile } from 'src/items/types';
import { getFileTypeByText, getSimpleRandomKey } from 'src/utils/global';
import Thumbnail from '../Thumbnail';
import { DropzoneProps } from './types';

export const Dropzone = (props: DropzoneProps) => {
  const [dropedFiles, setDropedFiles] = useState<UploadItemFile[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    const filesToAdd: UploadItemFile[] = [];

    for await (const file of acceptedFiles) {
      let uploadPreview = '';
      if (file.type.indexOf('image') >= 0) {
        uploadPreview = URL.createObjectURL(file);
      }
      filesToAdd.push({
        storagePath: file.name,
        tempId: getSimpleRandomKey(),
        uploadPreview,
        bytes: await file.arrayBuffer()
      } as UploadItemFile);
    }

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

  // TODO remove to a css file
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
  // TODO remove to a css file
  const focusedStyle = {
    borderColor: '#2196f3'
  };
  // TODO remove to a css file
  const acceptStyle = {
    borderColor: '#00e676'
  };
  // TODO remove to a css file
  const rejectStyle = {
    borderColor: '#ff1744'
  };
  // TODO remove to a css file
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

  const handleClickRadioType = (file: UploadItemFile, artifactType: string) => {
    const files = [...dropedFiles];
    const index = files.findIndex((file1) => file1.tempId === file.tempId);
    dropedFiles[index] = file;
    file.artifactType = getFileTypeByText(artifactType);
    setDropedFiles([...dropedFiles]);
  };

  const thumbnails = useMemo(
    () =>
      dropedFiles.map((file, index) => (
        <Thumbnail
          key={getSimpleRandomKey()}
          index={index}
          src={file.uploadPreview}
          altText={file.storagePath}
          className={
            props.validateFiles && !file.artifactType ? 'thumbnail-dropzone thumbnail-error' : 'thumbnail-dropzone'
          }>
          <>
            <RadioGroup
              aria-labelledby='radio-group-file-type-label'
              defaultValue={file.artifactType}
              name='radio-group-file-type'>
              {Object.keys(FileType).map((typeKey) => (
                <FormControlLabel
                  key={getSimpleRandomKey()}
                  value={typeKey}
                  control={<Radio size='small' />}
                  label={typeKey}
                  onClick={() => handleClickRadioType(file, typeKey)}
                />
              ))}
            </RadioGroup>
            <button onClick={() => removeFileFromUploadList(file.tempId)}>remove</button>
          </>
        </Thumbnail>
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
      <aside style={thumbsContainer as any}>{thumbnails}</aside>
      {renderRejections()}
    </section>
  );
};

export default memo(Dropzone);
