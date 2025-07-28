import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIsguestDefault1753456792396 implements MigrationInterface {
    name = 'FixIsguestDefault1753456792396';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isGuest" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isGuest" SET DEFAULT true`);
    }
}
