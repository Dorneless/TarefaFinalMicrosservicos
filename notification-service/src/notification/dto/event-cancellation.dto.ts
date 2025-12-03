import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EventCancellationDto {
    @ApiProperty({
        description: 'Nome do usuário',
        example: 'João Silva',
    })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name: string;

    @ApiProperty({
        description: 'Email do usuário',
        example: 'joao.silva@example.com',
    })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'O email é obrigatório' })
    email: string;

    @ApiProperty({
        description: 'Nome do evento',
        example: 'Workshop de Desenvolvimento Web',
    })
    @IsString()
    @IsNotEmpty({ message: 'O nome do evento é obrigatório' })
    eventName: string;

    @ApiProperty({
        description: 'Data do evento',
        example: '15/12/2025 às 14:00',
    })
    @IsString()
    @IsNotEmpty({ message: 'A data do evento é obrigatória' })
    eventDate: string;
}
