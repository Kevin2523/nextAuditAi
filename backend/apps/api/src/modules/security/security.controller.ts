import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('waf/rules')
  getWafRules() {
    return this.securityService.getWafRules();
  }

  @Get('waf/stats')
  getWafStats() {
    return this.securityService.getWafStats();
  }

  @Get('ids/signatures')
  getIdsSignatures() {
    return this.securityService.getIdsSignatures();
  }

  @Get('ids/stats')
  getIdsStats() {
    return this.securityService.getIdsStats();
  }

  @Get('logs')
  getLogs(
    @Query('event') event?: string,
    @Query('severity') severity?: string,
    @Query('ip') ip?: string,
    @Query('email') email?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.securityService.getLogs({
      event,
      severity,
      ip,
      email,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('summary')
  getSummary() {
    return this.securityService.getSummary();
  }

  @Post('waf/test')
  testWafPayload(@Body() body: { payload: string }) {
    return this.securityService.testWafPayload(body.payload);
  }
}
