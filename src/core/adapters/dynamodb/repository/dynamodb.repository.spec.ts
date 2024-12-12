import { EntityManager } from '@typedorm/core';
import { DynamoDBRepository } from './dynamodb.repository';
import { DatabaseTestingModule } from '@des/database/testing/database.testing-module';

class TestEntity {
  id: string;
  name: string;
}
const entity: TestEntity = new TestEntity();
entity.id = 'test-1recien tenemos dev';
entity.name = 'test';

const DBManager: EntityManager = DatabaseTestingModule.getMockManager<TestEntity>();

describe('DynamoDB Repository', () => {
  let repository: DynamoDBRepository<TestEntity>;

  beforeEach(() => {
    repository = DatabaseTestingModule.getMockRepository(new DynamoDBRepository(TestEntity), DBManager);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should get manager', async () => {
    const manager = await repository.manager();
    expect(manager).toBeDefined();
  });

  it(`should create`, async () => {
    const result = await repository.create(entity);
    expect(result.id).toBe(entity.id);
  });

  it('should find', async () => {
    const result = await repository.find({ id: entity.id });
    expect(result.length).toBe(1);
  });

  it('should find empty', async () => {
    const result = await repository.find({ id: entity.id + '1' });
    expect(result.length).toBe(0);
  });

  it('should find one', async () => {
    const result = await repository.findOne({ id: entity.id });
    expect(result.id).toBe(entity.id);
  });

  it(`should don't find one`, async () => {
    const result = await repository.findOne({ id: entity.id + 1 });
    expect(result).toBeNull();
  });

  it(`should update`, async () => {
    const data = entity;
    data.name = `${data.name}-1`;
    const result = await repository.update({ id: entity.id }, data);
    expect(result.name).toBe(data.name);
  });

  it(`shouldn't update`, async () => {
    let error: Error;
    try {
      const data = entity;
      data.name = `${data.name}-1`;
      await repository.update({ id: `${entity.id}1` }, data);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it(`should remove`, async () => {
    const toRemove = entity;
    toRemove.id = `${toRemove.id}-remove-test`;
    await repository.create(toRemove);
    const result = await repository.remove({ id: toRemove.id });
    expect(result).toBeTruthy();
  });

  it(`shouldn't remove`, async () => {
    const result = await repository.remove({ id: `${entity.id}12` });
    expect(result).toBeFalsy();
  });

  it(`should count`, async () => {
    const count = entity;
    count.id = `${count.id}-counter`;
    await repository.create(count);
    const result = await repository.count({ id: count.id });
    expect(result).toBe(1);
  });

  it(`shouldn't count`, async () => {
    const result = await repository.count({ id: `${entity.id}12` });
    expect(result).toBe(0);
  });

  it(`should exists`, async () => {
    const exists = entity;
    exists.id = `${exists.id}-exists`;
    await repository.create(exists);
    const result = await repository.exists({ id: exists.id });
    expect(result).toBeTruthy();
  });

  it(`shouldn't exists`, async () => {
    const result = await repository.exists({ id: `${entity.id}12` });
    expect(result).toBeFalsy();
  });
});
