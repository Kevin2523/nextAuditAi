import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FleetReadService } from './services/fleet-read.service';

@Controller('fleet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Viewer, Role.Admin, Role.SuperAdmin)
export class FleetReadController {
  constructor(private readonly fleetReadService: FleetReadService) {}

  @Get('hosts')
  getHosts() {
    return this.fleetReadService.getHosts();
  }

  @Get('vulnerabilities')
  getVulnerabilities() {
    return this.fleetReadService.getVulnerabilities();
  }

  @Post('sync')
  @Roles(Role.Admin, Role.SuperAdmin)
  sync() {
    return this.fleetReadService.sync();
  }
}
