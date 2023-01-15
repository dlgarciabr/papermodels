export interface ISetupUsePaginatedQuery {
  collectionName: string;
  items: any[];
  hasMore: boolean;
}

export interface ISetupUseInvoke extends ISetupUsePaginatedQuery {}
