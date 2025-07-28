import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMasterRating1753287937650 implements MigrationInterface {
    name = 'AddMasterRating1753287937650';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "masterRatings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ratingNumber" integer NOT NULL, "description" character varying, "createdAt" date NOT NULL, "nailMasterId" uuid, "clientId" uuid, CONSTRAINT "PK_0835a11d445e1bb102dec07e5ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "masterRatings" ADD CONSTRAINT "FK_9eb44b754c3e43ba169107ed5aa" FOREIGN KEY ("nailMasterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "masterRatings" ADD CONSTRAINT "FK_9dbdc27d5b377e780fb46ac8040" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "masterRatings"`);
        await queryRunner.query(`ALTER TABLE "masterRatings" DROP CONSTRAINT "FK_9eb44b754c3e43ba169107ed5aa"`);
        await queryRunner.query(`ALTER TABLE "masterRatings" DROP CONSTRAINT "FK_9dbdc27d5b377e780fb46ac8040"`);
    }
}
