import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    userEmail?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    body?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    statusCode?: number;

    @ApiProperty()
    @IsString()
    method: string;

    @ApiProperty()
    @IsString()
    service: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    ip?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    path?: string;
}
