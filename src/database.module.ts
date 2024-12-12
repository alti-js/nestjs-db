import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { ModelDefinition, MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSourceOptions } from 'typeorm';
import { DB_ENGINE } from './core/db.const';
import { TypeDormModuleOption, TypeDormModule } from '@nest-dynamodb/typedorm';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DocumentClientV3 } from '@typedorm/document-client';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type IDatabaseOptions = TypeOrmModuleOptions | MongooseModuleOptions | TypeDormModuleOption;

export type IDatabaseCredentials = DynamoDBClientConfig;
export type DBConfig = {
  options?: IDatabaseOptions;
  credentials?: IDatabaseCredentials;
  uri?: string;
};
export type IDatabaseConfig = {
  [key in DB_ENGINE]?: DBConfig;
};

export type DBForFeature = {
  models?: EntityClassOrSchema[] | ModelDefinition[];
  repositories?: any[];
  conn?: string | DataSourceOptions;
};

export type IDatabaseForFeatureConfig = {
  [key in DB_ENGINE]?: DBForFeature;
};

@Module({})
export class DatabaseModule {
  static forRoot(config: IDatabaseConfig): DynamicModule {
    const logger: Logger = new Logger(DatabaseModule.name);
    const dbModules: DynamicModule[] = Object.keys(config).map((key: string) => {
      const engine: DB_ENGINE = key as DB_ENGINE;
      let dbModule: DynamicModule;
      const opt: DBConfig = config[key];
      switch (engine) {
        case 'postgres':
        case 'mysql':
          dbModule = TypeOrmModule.forRoot(opt?.options as TypeOrmModuleOptions);
          break;
        case 'mongodb':
          dbModule = MongooseModule.forRoot(opt?.uri, opt.options as MongooseModuleOptions);
          break;
        case 'dynamodb':
          {
            const dbClient = DynamoDBDocumentClient.from(
              new DynamoDBClient({
                ...(opt?.credentials || {}),
                ...(opt?.uri ? { endpoint: opt.uri } : {}),
              }),
              {
                marshallOptions: {
                  removeUndefinedValues: true,
                },
              },
            );
            const documentClient = new DocumentClientV3(dbClient);
            logger.log(`Registering DynamoDB  connection for: ${(opt.options as TypeDormModuleOption)?.table?.name}`);
            logger.log(`DynamoDB table config: ${JSON.stringify((opt.options as TypeDormModuleOption)?.table || {})}`);
            dbModule = TypeDormModule.forRoot({
              ...(opt?.options as TypeDormModuleOption),
              documentClient,
            });
          }
          break;
      }
      return dbModule;
    });
    return {
      global: true,
      module: DatabaseModule,
      imports: dbModules,
      exports: dbModules,
    };
  }
  static forFeature(config: IDatabaseForFeatureConfig): DynamicModule {
    let providers: Provider[] = [];
    const dbModules: DynamicModule[] = Object.keys(config)
      .map((key: string) => {
        const engine: DB_ENGINE = key as DB_ENGINE;
        const { models, repositories, conn }: DBForFeature = config[key];
        providers = [...providers, ...(repositories || [])];
        switch (engine) {
          case 'postgres':
          case 'mysql':
            return TypeOrmModule.forFeature(models as EntityClassOrSchema[], conn);
          case 'mongodb':
            return MongooseModule.forFeature(models as ModelDefinition[], conn as string);
          default:
            return null;
        }
      })
      .filter((mod) => !!mod);
    return {
      module: DatabaseModule,
      providers: [...(providers || [])],
      imports: dbModules,
      exports: [...dbModules, ...(providers || [])],
    };
  }
}
