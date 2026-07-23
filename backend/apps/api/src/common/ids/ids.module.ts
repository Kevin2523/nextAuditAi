import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { IdsService } from './ids.service';

@Global()
@Module({
  providers: [IdsService],
  exports: [IdsService],
})
export class IdsModule implements OnModuleDestroy {
  constructor(private readonly idsService: IdsService) {}

  onModuleDestroy(): void {
    this.idsService.cleanup();
  }
}
