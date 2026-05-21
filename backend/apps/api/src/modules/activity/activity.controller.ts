import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { N8nActivityService } from './services/n8n-activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Viewer, Role.Admin, Role.SuperAdmin)
export class ActivityController {
  constructor(private readonly n8nActivityService: N8nActivityService) {}

  @Get('executions')
  getExecutions(@Query('limit') limit?: string) {
    return this.n8nActivityService.getExecutions(limit);
  }
}
