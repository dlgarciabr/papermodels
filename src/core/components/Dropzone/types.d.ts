export type DropzoneFile = File & { tempId: string; preview: string };

export type DropzoneProps = {
  onDropedFilesChange?: (dropedFiles: DropzoneFile[]) => void;
};
