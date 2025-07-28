import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComplementOrder1752422523626 implements MigrationInterface {
    name = 'ComplementOrder1752422523626';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "completedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "completedBy" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "rating" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "completedAt"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "completedBy"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "rating"`);
    }
}
