import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (response?.message && response?.data) {
          return {
            success: true,
            message: response.message,
            data: response.data,
          };
        } else if (!response.data) {
          return {
            success: true,
            message: response.message,
          };
        }

        return {
          success: true,
          data: response.data,
        };
      }),
    );
  }
}
