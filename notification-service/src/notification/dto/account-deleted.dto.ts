import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AccountDeletedDto {
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
}
