import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  create(@Request() req, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  findAll(
    @Request() req,
    @Query('status') status?: InvoiceStatus,
    @Query('contactId') contactId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.findAll(req.user.tenantId, { status, contactId, search, page, limit });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Revenue summary' })
  getSummary(@Request() req) {
    return this.invoicesService.getRevenueSummary(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.invoicesService.findById(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(req.user.tenantId, id, dto);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  markAsPaid(@Request() req, @Param('id') id: string) {
    return this.invoicesService.markAsPaid(req.user.tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Request() req, @Param('id') id: string) {
    return this.invoicesService.remove(req.user.tenantId, id);
  }
}
