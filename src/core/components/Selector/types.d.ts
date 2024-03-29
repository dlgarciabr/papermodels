export interface ISelectorProps {
  label: string;
  jsonSelectors: string;
  onChangeSelectors: (modifiedJsonSelectors: string) => void;
  leftKey: string;
  rightKey: string;
  hasError?: boolean;
  errorMessage?: string;
  leftXS?: number;
  rightXS?: number;
}
