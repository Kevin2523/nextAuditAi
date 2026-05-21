import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { AiChatDto, AiRemediationDto, AiReportDto } from './dto/ai-chat.dto';
import { AiChatService } from './services/ai-chat.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.SuperAdmin)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  sendMessage(@Body() body: AiChatDto) {
    return this.aiChatService.sendMessage(body);
  }

  @Post('remediation')
  requestRemediation(@Body() body: AiRemediationDto) {
    return this.aiChatService.requestRemediation(body);
  }

  @Post('reports')
  generateReport(@Body() body: AiReportDto) {
    return this.aiChatService.generateReport(body);
  }
}
