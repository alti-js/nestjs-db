export type EntityClass = new (...args: any[]) => any;
export abstract class BaseRepository<T, ConnOpt, Mng> {
  constructor(
    protected entityCls: EntityClass,
    protected conn?: string | ConnOpt,
  ) {}
  abstract manager(): Promise<Mng>;
  abstract find(query: Partial<T>, options?: any): Promise<T[]>;
  abstract findOne(query: Partial<T>, options?: any): Promise<T>;
  abstract count(query: Partial<T>, options?: any): Promise<number>;
  abstract exists(query: Partial<T>, options?: any): Promise<boolean>;
  abstract create(params: Partial<T>, options?: any): Promise<T>;
  abstract update(query: Partial<T>, data: Partial<T>, options?: any): Promise<T>;
  abstract remove(query: Partial<T>, options?: any): Promise<boolean>;
}
