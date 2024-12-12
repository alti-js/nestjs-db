export class MockEntityManager<T> {
  entities: T[];
  findOne(Class: any, query: Partial<T>, options?: any): Promise<T> {
    if (!Class) {
      return Promise.reject(new Error(`Invalid config: ${options ? JSON.parse(options) : ''}`));
    }
    const data = (this.entities || []).find((obj) => !Object.keys(query).some((key) => query[key] !== obj[key]));
    return Promise.resolve(data || null);
  }
  find(Class: any, query: Partial<T>, options?: any): Promise<{ items: T[] }> {
    if (!Class) {
      return Promise.reject(new Error(`Invalid config: ${options ? JSON.parse(options) : ''}`));
    }
    const items = (this.entities || []).filter((obj) => !Object.keys(query).some((key) => query[key] !== obj[key]));
    return Promise.resolve({ items });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(params: Partial<T>, options?: any): Promise<T> {
    let obj: T = {} as T;
    Object.keys(params).forEach((k) => {
      obj = { ...obj, [k]: params[k] };
    });
    this.entities = [...(this.entities || []), obj];
    return Promise.resolve(obj);
  }
  async update(Class: any, query: Partial<T>, params: Partial<T>, options?: any): Promise<T> {
    let data: T = await this.findOne(Class, query, options);
    const original = data;
    if (!data) {
      throw new Error(`Not found`);
    }
    Object.keys(params).forEach((k) => {
      data = { ...data, [k]: params[k] };
    });
    this.entities = this.entities.map((ent) => (ent === original ? data : ent));
    return data;
  }
  async delete(Class: any, query: Partial<T>, options?: any): Promise<{ success: boolean }> {
    const data: T = await this.findOne(Class, query, options);
    if (!data) {
      return { success: false };
    }
    this.entities = this.entities.filter((ent) => ent !== data);
    return { success: true };
  }
  async count(Class: any, query: Partial<T>, options?: any): Promise<number> {
    return (await this.find(Class, query, options)).items.length;
  }
  async exists(Class: any, query: Partial<T>, options?: any): Promise<boolean> {
    return !!(await this.findOne(Class, query, options));
  }
}
