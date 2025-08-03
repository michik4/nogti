import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteEstimatedPriceInSnapshot1754239936292 implements MigrationInterface {
    name = 'DeleteEstimatedPriceInSnapshot1754239936292';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_design_snapshots" DROP COLUMN "estimatedPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_design_snapshots" ADD "estimatedPrice" numeric(10,2)`);
    }
}
