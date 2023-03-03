export interface IError extends Error {
  reference: string;
  value: string;
}

export interface IPageItem {
  url: string;
  itemId?: number;
  name?: string;
  categoryName?: string;
}
