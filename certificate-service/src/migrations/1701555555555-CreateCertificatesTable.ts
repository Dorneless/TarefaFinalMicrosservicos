import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificatesTable1701555555555 implements MigrationInterface {
    name = 'CreateCertificatesTable1701555555555';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "certificates_schema"`);
        await queryRunner.query(
            `CREATE TABLE "certificates_schema"."certificates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "user_email" character varying NOT NULL,
        "user_name" character varying NOT NULL,
        "event_id" uuid NOT NULL,
        "event_name" character varying NOT NULL,
        "event_date" TIMESTAMP NOT NULL,
        "issued_at" TIMESTAMP NOT NULL DEFAULT now(),
        "pdf_path" character varying NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_certificate_code" UNIQUE ("code"),
        CONSTRAINT "PK_certificates" PRIMARY KEY ("id")
      )`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_certificate_code" ON "certificates_schema"."certificates" ("code")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_certificate_user_id" ON "certificates_schema"."certificates" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_certificate_event_id" ON "certificates_schema"."certificates" ("event_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "certificates_schema"."IDX_certificate_event_id"`);
        await queryRunner.query(`DROP INDEX "certificates_schema"."IDX_certificate_user_id"`);
        await queryRunner.query(`DROP INDEX "certificates_schema"."IDX_certificate_code"`);
        await queryRunner.query(`DROP TABLE "certificates_schema"."certificates"`);
        await queryRunner.query(`DROP SCHEMA "certificates_schema"`);
    }
}
