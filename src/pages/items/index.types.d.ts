export interface ISearchData {
  expression?: string;
  categoryId?: number;
  items: Item[];
  currentPage: number;
  pages: number;
}
