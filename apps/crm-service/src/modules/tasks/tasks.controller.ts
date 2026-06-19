import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './tasks.repository';
import { TaskStatus } from '@nexcrm/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly svc: TasksService) {}
  @Get() @ApiOperation({ summary: 'Listar tarefas' }) findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status: TaskStatus, @Query('assignedToId') assignedToId: string, @Request() req: any) { return this.svc.findAll(req.user.tenantId, +page, +limit, status, assignedToId); }
  @Get(':id') @ApiOperation({ summary: 'Buscar tarefa por ID' }) findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.findById(id, req.user.tenantId); }
  @Post() @ApiOperation({ summary: 'Criar tarefa' }) create(@Body() dto: CreateTaskDto, @Request() req: any) { return this.svc.create(req.user.tenantId, req.user.id, dto); }
  @Put(':id') @ApiOperation({ summary: 'Atualizar tarefa' }) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateTaskDto>, @Request() req: any) { return this.svc.update(id, req.user.tenantId, req.user.id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Remover tarefa' }) remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.remove(id, req.user.tenantId, req.user.id); }
}
