export type DropzoneProps = {
  reset?: () => void;
  onDropedFilesChange?: (dropedFiles: DropzoneFile[]) => void;
};
