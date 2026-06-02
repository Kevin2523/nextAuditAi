import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUsersService } from './services/admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SuperAdmin)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers(@CurrentUser() user: CurrentUser) {
    return this.adminUsersService.listUsers(user.tenantId);
  }

  @Post()
  createUser(@CurrentUser() user: CurrentUser, @Body() body: CreateAdminUserDto) {
    return this.adminUsersService.createUser(user.tenantId, body);
  }

  @Patch(':userId')
  updateUser(@CurrentUser() user: CurrentUser, @Param('userId') userId: string, @Body() body: UpdateAdminUserDto) {
    return this.adminUsersService.updateUser(user.tenantId, user.sub, userId, body);
  }
}
