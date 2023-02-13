export interface IError extends Error {
  reference: string;
  value: string;
}
