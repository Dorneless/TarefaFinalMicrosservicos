import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
    constructor(
        @InjectRepository(Log)
        private logsRepository: Repository<Log>,
    ) { }

    async create(createLogDto: CreateLogDto): Promise<Log> {
        const log = this.logsRepository.create(createLogDto);
        return this.logsRepository.save(log);
    }

    async findAll(): Promise<Log[]> {
        return this.logsRepository.find({ order: { timestamp: 'DESC' } });
    }
}
