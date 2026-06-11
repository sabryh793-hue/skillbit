import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import z from 'zod'

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodObject) {}//zod object is a schema that defines the shape of the data we expect to receive

  async transform(value: any, metadata: ArgumentMetadata) {
    const result = await this.schema.safeParseAsync(value)//safeParseAsync is a method that validates the data against the schema and returns a result object that contains a success property and an error property if the validation fails.
    if (!result.success) {
      throw new BadRequestException(result.error.issues/*.map((issue) => issue.message)*/)//if the validation fails, we throw a BadRequestException with the error messages from the validation result.
    }
    return result.data
  }
}