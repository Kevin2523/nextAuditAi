import { Global, Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WafService } from './waf.service';
import { WafMiddleware } from './waf.middleware';

@Global()
@Module({
  providers: [WafService, WafMiddleware],
  exports: [WafService],
})
export class WafModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(WafMiddleware).forRoutes('*');
  }
}
