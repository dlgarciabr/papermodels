import { FileType } from '@prisma/client';
import { FileThumbnailProps } from './types';

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

  const hasError = validationEnable && !file.artifactType;

  return (
    <div key={file.name} className={`thumbnail ${hasError ? 'error' : ''}`} style={hasError ? thumbError : {}}>
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
              // onLoad={() => {
              //   URL.revokeObjectURL(file.preview);
              // }}
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
          onClick={() => onClickRadioType(file.tempId, FileType.scheme)}
          defaultChecked={file.artifactType === FileType.scheme}
        />
        <label htmlFor={FileType.scheme}>{FileType.scheme}</label>
        <br />
        <input
          type='radio'
          id={FileType.instruction}
          name={`${file.tempId}_artifactType`}
          onClick={() => onClickRadioType(file.tempId, FileType.instruction)}
          defaultChecked={file.artifactType === FileType.instruction}
        />
        <label htmlFor={FileType.instruction}>{FileType.instruction}</label>
        <br />
        <input
          type='radio'
          id={FileType.preview}
          name={`${file.tempId}_artifactType`}
          onClick={() => onClickRadioType(file.tempId, FileType.preview)}
          defaultChecked={file.artifactType === FileType.preview}
        />
        <label htmlFor={FileType.preview}>{FileType.preview}</label>
        <br />
        <button onClick={() => onClickRemove(file.tempId)}>remove</button>
      </div>
    </div>
  );
};

export default FileThumbnail;
