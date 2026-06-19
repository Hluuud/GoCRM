import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  Request, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateContactDto } from './contacts.repository';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

class ContactQueryDto {
  @IsOptional() @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
}

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'contacts', version: '1' })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contatos' })
  findAll(@Query() q: ContactQueryDto, @Request() req: any) {
    return this.contactsService.findAll(req.user.tenantId, q.page!, q.limit!, q.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contato por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.contactsService.findById(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar contato' })
  create(@Body() dto: CreateContactDto, @Request() req: any) {
    return this.contactsService.create(req.user.tenantId, req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar contato' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateContactDto>, @Request() req: any) {
    return this.contactsService.update(id, req.user.tenantId, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover contato' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.contactsService.remove(id, req.user.tenantId, req.user.id);
  }
}
