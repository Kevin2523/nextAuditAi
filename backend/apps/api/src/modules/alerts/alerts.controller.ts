import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AlertsService } from './services/alerts.service';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Viewer, Role.Admin, Role.SuperAdmin)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  listAlerts(@CurrentUser() user: CurrentUser, @Query('limit') limit?: string) {
    return this.alertsService.listAlerts(user.tenantId, limit);
  }
}
