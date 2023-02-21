export interface IError extends Error {
  reference: string;
  value: string;
}

export interface IPageItem {
  url: string;
  name?: string;
  categoryName?: string;
}
