import { Controller, Get } from '@nestjs/common';
import { APP_NAME, type ApiHealthResponse } from '@tmh/shared';

@Controller('health')
export class HealthController {
  @Get()
  check(): ApiHealthResponse {
    return {
      status: 'ok',
      service: `${APP_NAME} API`,
      timestamp: new Date().toISOString(),
    };
  }
}
