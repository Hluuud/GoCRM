import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'leads', version: '1' })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar leads com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de leads paginada.' })
  findAll(@Query() query: LeadQueryDto, @Request() req: any) {
    return this.leadsService.findAll(req.user.tenantId, query);
  }

  @Get('stats/status')
  @ApiOperation({ summary: 'Contagem de leads por status' })
  getStatusCounts(@Request() req: any) {
    return this.leadsService.getStatusCounts(req.user.tenantId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'UUID do lead' })
  @ApiOperation({ summary: 'Buscar lead por ID' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.leadsService.findById(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo lead' })
  @ApiResponse({ status: 201, description: 'Lead criado com sucesso.' })
  create(@Body() dto: CreateLeadDto, @Request() req: any) {
    return this.leadsService.create(req.user.tenantId, req.user.id, dto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'UUID do lead' })
  @ApiOperation({ summary: 'Atualizar lead' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @Request() req: any,
  ) {
    return this.leadsService.update(id, req.user.tenantId, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'UUID do lead' })
  @ApiOperation({ summary: 'Remover lead (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.leadsService.remove(id, req.user.tenantId, req.user.id);
  }
}
