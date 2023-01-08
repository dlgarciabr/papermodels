import { FileType } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadItemFile } from 'src/pageComponents/items/types';
import { getSimpleRandomKey } from 'src/utils/global';

import { DropzoneProps, FileThumbnailProps } from './types';

const FileThumbnail = ({ file, onClickRemove, onClickRadioType, validationEnable }: FileThumbnailProps) => {
  // TODO remove after defined styling method
  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
  };

  // TODO remove after defined styling method
  const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
  };

  // TODO remove after defined styling method
  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
  };

  // TODO remove after styling pattern have been defined
  const thumbError = {
    borderStyle: 'double',
    borderWidth: '1px',
    borderColor: 'red'
  };

  return (
    <div key={file.name} style={validationEnable && !file.artifactType ? thumbError : {}}>
      <div style={thumb as any} key={file.name}>
        <div style={thumbInner}>
          {file.type === 'application/pdf' ? (
            'pdf file'
          ) : (
            // TODO eveluate the use of next/image here
            // <Image
            //   src={file.preview}
            //   alt={file.name}
            //   style={img}
            //   // Revoke data uri after image is loaded
            //   onLoad={() => {
            //     URL.revokeObjectURL(file.preview);
            //   }}
            //   width={70}
            //   height={100}
            // />
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.preview}
              alt={file.name}
              style={img}
              // Revoke data uri after image is loaded
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          )}
        </div>
      </div>
      <div>
        <p>{file.name}</p>
        <input
          type='radio'
          id={FileType.scheme}
          name={`${file.tempId}_artifactType`}
          value='HTML'
          onClick={() => onClickRadioType(file.tempId, FileType.scheme)}
          defaultChecked={file.artifactType === FileType.scheme}
        />
        <label htmlFor='html'>{FileType.scheme}</label>
        <br />
        <input
          type='radio'
          id={FileType.instruction}
          name={`${file.tempId}_artifactType`}
          value='CSS'
          onClick={() => onClickRadioType(file.tempId, FileType.instruction)}
          defaultChecked={file.artifactType === FileType.instruction}
        />
        <label htmlFor='css'>{FileType.instruction}</label>
        <br />
        <input
          type='radio'
          id={FileType.preview}
          name={`${file.tempId}_artifactType`}
          value='JavaScript'
          onClick={() => onClickRadioType(file.tempId, FileType.preview)}
          defaultChecked={file.artifactType === FileType.preview}
        />
        <label htmlFor='javascript'>{FileType.preview}</label>
        <br />
        <button onClick={() => onClickRemove(file.tempId)}>remove</button>
      </div>
    </div>
  );
};

export const Dropzone = (props: DropzoneProps) => {
  const [dropedFiles, setDropedFiles] = useState<UploadItemFile[]>([]);
  const onDrop = (acceptedFiles) => {
    const filesToAdd = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        tempId: getSimpleRandomKey()
      })
    );
    const newFileList = [...filesToAdd, ...dropedFiles];
    setDropedFiles(newFileList);
    if (props.onDropedFilesChange) {
      props.onDropedFilesChange(newFileList);
    }
  };

  const options = {
    onDrop,
    maxFiles: 5,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg, .jpg'],
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf']
    },
    validator: () => (dropedFiles.length >= 5 ? { code: 'too-many-files', message: 'too many files' } : null)
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, fileRejections } = useDropzone(options);

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

  useEffect(() => {
    return () => dropedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  });

  const renderRejections = () => {
    if (fileRejections.length > 0) {
      return fileRejections.map((rejection, index) => {
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

  const thumbs = dropedFiles.map((file: UploadItemFile) => (
    <FileThumbnail
      key={getSimpleRandomKey()}
      file={file}
      onClickRadioType={handleClickRadioType}
      onClickRemove={removeFileFromUploadList}
      validationEnable={props.validateFiles}
    />
  ));

  return (
    <section className='container'>
      <div {...getRootProps({ className: 'dropzone', style: style as any })}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
        <em>(2 files are the maximum number of files you can drop here)</em>
      </div>
      <aside style={thumbsContainer as any}>{thumbs}</aside>
      {renderRejections()}
    </section>
  );
};

export default Dropzone;
