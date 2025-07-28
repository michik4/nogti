import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUploadByAtNailDesign1751423125800 implements MigrationInterface {
    name = 'AddUploadByAtNailDesign1751423125800';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nail_designs" ADD "uploadedByMasterId" uuid`);
        await queryRunner.query(`ALTER TABLE "nail_designs" ADD CONSTRAINT "FK_21831dac390d75faaed9879b437" FOREIGN KEY ("uploadedByMasterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nail_designs" DROP COLUMN "uploadedByMasterId"`);
        await queryRunner.query(`ALTER TABLE "nail_designs" DROP CONSTRAINT "FK_21831dac390d75faaed9879b437"`);
    }
}
