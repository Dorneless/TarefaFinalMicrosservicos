import { Controller, Post, Body, Get } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo log' })
    create(@Body() createLogDto: CreateLogDto) {
        return this.logsService.create(createLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os logs' })
    findAll() {
        return this.logsService.findAll();
    }
}
