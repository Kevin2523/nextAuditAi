import { Module } from '@nestjs/common';
import { SecurityDemoController } from './security-demo.controller';
import { SecurityDemoService } from './security-demo.service';

@Module({
  controllers: [SecurityDemoController],
  providers: [SecurityDemoService],
})
export class SecurityDemoModule {}
