import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('logs', { schema: 'logs_schema' })
export class Log {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    userEmail: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'text', nullable: true })
    body: string;

    @Column({ nullable: true })
    statusCode: number;

    @Column()
    method: string;

    @Column()
    service: string;

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    path: string;
}
