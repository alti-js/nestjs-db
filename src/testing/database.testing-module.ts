import { Test } from '@nestjs/testing';
import { EntityManager } from '@typedorm/core';
import { MockEntityManager } from './mocks/db-manager.mock';
import { DynamoDBRepository } from '../core/adapters/dynamodb/repository/dynamodb.repository';

export class DatabaseTestingModule {
  static async forInternalTesting() {
    return await Test.createTestingModule({
      providers: [],
    }).compile();
  }

  static getMockManager<T>(): EntityManager {
    return new MockEntityManager<T>() as unknown as EntityManager;
  }

  static getMockRepository<T>(repository, manager?: EntityManager): DynamoDBRepository<T> {
    jest
      .spyOn(repository, 'manager')
      .mockImplementation(() => Promise.resolve(manager || DatabaseTestingModule.getMockManager<T>()));
    return repository;
  }
}
