export type DropzoneProps = {
  reset?: () => void;
  onDropedFilesChange?: (dropedFiles: DropzoneFile[]) => void;
  validateFiles: boolean;
};

export type FileThumbnailProps = {
  file: UploadItemFile;
  onClickRemove: (fileId: string) => void;
  onClickRadioType: (fileId: string, artifactType: FileType) => void;
  validationEnable: boolean;
};
