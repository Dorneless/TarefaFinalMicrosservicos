import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('certificates')
export class Certificate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    code: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'user_email' })
    userEmail: string;

    @Column({ name: 'user_name' })
    userName: string;

    @Column({ name: 'event_id', type: 'uuid' })
    @Index()
    eventId: string;

    @Column({ name: 'event_name' })
    eventName: string;

    @Column({ name: 'event_date', type: 'timestamp' })
    eventDate: Date;

    @CreateDateColumn({ name: 'issued_at' })
    issuedAt: Date;

    @Column({ name: 'pdf_path' })
    pdfPath: string;

    @Column({ default: true })
    active: boolean;
}
