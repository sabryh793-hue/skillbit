import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'

@Injectable()
export class TestPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log({ value, metadata })

     if (value.password && value.confirmPassword) {
      if (value.password !== value.confirmPassword) {
        throw new BadRequestException(
          'password must be equal to confirm password',
        );
      }
    }
    return value
  }
}