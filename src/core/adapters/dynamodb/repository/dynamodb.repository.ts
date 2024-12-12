import { EntityManager, getEntityManager } from '@typedorm/core';
import { BaseRepository } from '../../../repository/base.repository';
import { EntityAttributes } from '@typedorm/common';

export class DynamoDBRepository<T> extends BaseRepository<T, string, EntityManager> {
  constructor(entityClass: new (...args: any[]) => T, connection?: string) {
    super(entityClass, connection);
  }
  manager(): Promise<EntityManager> {
    return Promise.resolve(this.conn ? getEntityManager(this.conn) : getEntityManager());
  }
  async find(query: Partial<T>, partitionKey?: Partial<EntityAttributes<T>>, options?: any): Promise<T[]> {
    const manager = await this.manager();
    const { items } = await manager.find<T>(this.entityCls, query, partitionKey, options);
    return items;
  }
  async findOne(query: Partial<T>, options?: any): Promise<T> {
    const manager = await this.manager();
    const data: T = await manager.findOne<T>(this.entityCls, query, options);
    return data;
  }
  async count(query: Partial<T>, options?: any): Promise<number> {
    const manager = await this.manager();
    const counter: number = await manager.count<T>(this.entityCls, query, options);
    return counter;
  }
  async exists(query: Partial<T>, options?: any): Promise<boolean> {
    const manager = await this.manager();
    const exists: boolean = await manager.exists<T>(this.entityCls, query, options);
    return exists;
  }
  async create(params: T, options?: any): Promise<T> {
    const manager = await this.manager();
    const entity: T = await manager.create<T>(params, options);
    return entity;
  }
  async update(query: Partial<T>, params: Partial<T>, options?: any): Promise<T> {
    const manager = await this.manager();
    const entity: T = await manager.update<T>(this.entityCls, query, params, options);
    return entity;
  }
  async remove(query: Partial<T>, options?: any): Promise<boolean> {
    const manager = await this.manager();
    const { success }: { success: boolean } = await manager.delete<T>(this.entityCls, query, options);
    return success;
  }
}
