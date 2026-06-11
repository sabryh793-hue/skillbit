import {
  Model,
  MongooseBaseQueryOptions,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
  QueryFilter,
  DeleteResult,
} from 'mongoose'


export abstract class DBService<T> { //abstract class to avoid direct instantiation, ensuring that only subclasses can be created
  constructor(private readonly model: Model<T>) {}


   async create( data: any ) : Promise<T> {
    return await this.model.create(data)
  }
  
  async insertMany(data: any[]) {
    return await this.model.insertMany(data)
  }

  async find(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ) {
    return await this.model.find(filter || {}, projection, options)
  }

  async findOne({
    filter={},
    projection = {},
    options = {},
  }: {
    filter?: QueryFilter<T> | any
    projection?: ProjectionType<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findOne(filter, projection, options)
  }

  async findById({
    id,
    projection = {},
    options = {},
  }: {
    id: any
    projection?: ProjectionType<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findById(id, projection, options)
  }

  async Update({
    filter,
    update,
    options = {},
  }: {
    filter: QueryFilter<T>
    update: UpdateQuery<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findOneAndUpdate(filter, update, options)
  }

   async findByIdAndUpdate({
    id,
    update,
    options = {},
  }: {
    id: string | Types.ObjectId
    update: UpdateQuery<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findByIdAndUpdate(id, update, options)
  }
  
  async findByIdAndDelete({
    id,
    options,
  }: {
    id?: string | Types.ObjectId
    options?: QueryOptions<T>
  }) {
    return await this.model.findByIdAndDelete(id, options)
  }

  async findOneAndDelete({
    filter,
    options = {},
  }: {
    filter?: QueryFilter<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findOneAndDelete(filter, options)
  }

  async findOneAndUpdate({
    filter,
    update,
    options = {},
  }: {
    filter: QueryFilter<T> | any
    update: UpdateQuery<T>
    options?: QueryOptions<T>
  }) {
    return await this.model.findOneAndUpdate(filter, update, options)
  }

  async deleteOne({
  filter,
  options = {},
}: {
  filter: QueryFilter<T>
  options?: MongooseBaseQueryOptions<T>
}): Promise<DeleteResult> {
  return await this.model.deleteOne(filter, options)
}

async deleteMany({
  filter,
  options = {},
}: {
  filter: QueryFilter<T>
  options?: MongooseBaseQueryOptions<T>
}): Promise<DeleteResult> {
  return await this.model.deleteMany(filter, options)
}

  
}
