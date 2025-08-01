import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEstimatedPriceFromDesigns1754013055814 implements MigrationInterface {
    name = 'RemoveEstimatedPriceFromDesigns1754013055814';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nail_designs" DROP COLUMN "estimatedPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nail_designs" ADD "estimatedPrice" numeric(10,2)`);
    }
}
