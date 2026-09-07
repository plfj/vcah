import { ValidationException } from '../exceptions';

export interface PipeTransform<T = any, R = any> {
  transform(value: T): R;
}

export class ValidationPipe implements PipeTransform {
  transform(value: any): any {
    if (value === null || value === undefined) {
      throw new ValidationException('Request payload cannot be empty or undefined');
    }
    return value;
  }
}

export class ParseIntPipe implements PipeTransform {
  transform(value: string | number): number {
    const parsed = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ValidationException(`Value "${value}" is not a valid integer`);
    }
    return parsed;
  }
}
