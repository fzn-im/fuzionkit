export type PageableRequest<S> = PageableRequestPaged | PageableRequestSeeked<S>;

export type PageableRequestPaged = {
  pageNumber: number;
  pageSize: number;
  sort: Order[];
}

export type PageableRequestSeeked<S> = {
  startAt?: S | null;
  pageSize: number;
  sort: Order[];
}

export type Order = {
  property: string;
  direction: Direction;
}

export type Direction = 'ASC' | 'DESC';

export type Pageable<S> = {
  pageableRequest?: PageableRequest<S>;
  sortables: string[];
  totalSize: number;
  hasMore?: boolean;
  lastAt?: S;
}

export type PageableListApiResponse<T, S> = {
  pageable?: Pageable<S>;
  list: T[];
};

export class PageableList<T, S> {
  pageable?: Pageable<S>;
  list: T[];

  constructor(pageableList: Partial<PageableList<T, S>>) {
    Object.assign(this, { ...pageableList });
  }

  static fromApiResponse<T, S>(pageableList: PageableListApiResponse<T, S>): PageableList<T, S> {
    return new PageableList(pageableList);
  }
}

export type PageableContentApiResponse<T, S> = {
  pageable?: Pageable<S>;
  content: T;
}

export class PageableContent<T, S> {
  pageable?: Pageable<S>;
  content: T;

  constructor(pageableContent: Partial<PageableContent<T, S>>) {
    Object.assign(this, { ...pageableContent });
  }

  static fromApiResponse<T, S>(pageableContent: PageableListApiResponse<T, S>): PageableContent<T, S> {
    return new PageableContent(pageableContent);
  }
}
