import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './companies.repository';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly svc: CompaniesService) {}
  @Get() @ApiOperation({ summary: 'Listar empresas' }) findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search: string, @Request() req: any) { return this.svc.findAll(req.user.tenantId, +page, +limit, search); }
  @Get(':id') @ApiOperation({ summary: 'Buscar empresa por ID' }) findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.findById(id, req.user.tenantId); }
  @Post() @ApiOperation({ summary: 'Criar empresa' }) create(@Body() dto: CreateCompanyDto, @Request() req: any) { return this.svc.create(req.user.tenantId, req.user.id, dto); }
  @Put(':id') @ApiOperation({ summary: 'Atualizar empresa' }) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCompanyDto>, @Request() req: any) { return this.svc.update(id, req.user.tenantId, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Remover empresa' }) remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { return this.svc.remove(id, req.user.tenantId); }
}
