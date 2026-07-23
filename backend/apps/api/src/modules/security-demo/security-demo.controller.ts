import { Body, Controller, Get, Post } from '@nestjs/common';
import { SecurityDemoService } from './security-demo.service';

@Controller('security/demo')
export class SecurityDemoController {
  constructor(private readonly demoService: SecurityDemoService) {}

  @Get('status')
  getStatus() {
    return this.demoService.getStatus();
  }

  @Post('command')
  executeCommand(@Body() body: { command: string }) {
    return this.demoService.executeCommand(body.command);
  }
}
