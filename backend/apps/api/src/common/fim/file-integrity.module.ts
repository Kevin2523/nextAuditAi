import { Global, Module } from '@nestjs/common';
import { FileIntegrityService } from './file-integrity.service';

@Global()
@Module({
  providers: [FileIntegrityService],
  exports: [FileIntegrityService],
})
export class FileIntegrityModule {}
