import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './deals.repository';
import { DealStage } from '@nexcrm/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly svc: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar deals' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('stage') stage: DealStage, @Request() req: any) {
    return this.svc.findAll(req.user.tenantId, +page, +limit, stage);
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Dados do Kanban agrupados por estágio' })
  kanban(@Request() req: any) { return this.svc.getKanbanBoard(req.user.tenantId); }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar deal por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.findById(id, req.user.tenantId); }

  @Post()
  @ApiOperation({ summary: 'Criar deal' })
  create(@Body() dto: CreateDealDto, @Request() req: any) { return this.svc.create(req.user.tenantId, req.user.id, dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar deal (inclui mover no kanban)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateDealDto>, @Request() req: any) {
    return this.svc.update(id, req.user.tenantId, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover deal' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.remove(id, req.user.tenantId, req.user.id); }
}
