import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { EventDto } from '../dto/event'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

@Injectable()
export class EventPipe implements PipeTransform {
  async transform(value: EventDto, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value
    }

    const DTO = plainToInstance(metadata.metatype, value) as object
    const errors = await validate(DTO)

    if (errors.length > 0) {
      const errorMessages = errors.map((err) => ({
        field: err.property,
        constraints: err.constraints,
      }))

      throw new HttpException(
        {
          message: 'Validation failed',
          errors: errorMessages,
        },
        HttpStatus.BAD_REQUEST
      )
    }

    return value
  }
}
