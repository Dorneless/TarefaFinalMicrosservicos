import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TemporaryCodeDto {
    @ApiProperty({
        description: 'Email do usuário',
        example: 'joao.silva@example.com',
    })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'O email é obrigatório' })
    email: string;

    @ApiProperty({
        description: 'Código temporário',
        example: '123456',
    })
    @IsString()
    @IsNotEmpty({ message: 'O código é obrigatório' })
    code: string;

    @ApiProperty({
        description: 'Tempo de expiração em minutos',
        example: 15,
    })
    @IsNumber({}, { message: 'O tempo de expiração deve ser um número' })
    @IsNotEmpty({ message: 'O tempo de expiração é obrigatório' })
    expirationMinutes: number;
}
