import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceDesignRelations1751410413724 implements MigrationInterface {
    name = 'AddServiceDesignRelations1751410413724';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "master_service_designs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customPrice" numeric(10,2), "additionalDuration" integer, "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "masterServiceId" uuid, "nailDesignId" uuid, CONSTRAINT "PK_d5748366ced73f4b4fc015ba25c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "masterServiceId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_service_designs" ADD CONSTRAINT "FK_17c2c32918c349efbef3213d46d" FOREIGN KEY ("masterServiceId") REFERENCES "master_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_service_designs" ADD CONSTRAINT "FK_bd5343895f4daaf33df31c195b3" FOREIGN KEY ("nailDesignId") REFERENCES "nail_designs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_efcc2d6d34f3d6e466037ac3f45" FOREIGN KEY ("masterServiceId") REFERENCES "master_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "master_service_designs"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "masterServiceId"`);
        await queryRunner.query(`ALTER TABLE "master_service_designs" DROP CONSTRAINT "FK_17c2c32918c349efbef3213d46d"`);
        await queryRunner.query(`ALTER TABLE "master_service_designs" DROP CONSTRAINT "FK_bd5343895f4daaf33df31c195b3"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_efcc2d6d34f3d6e466037ac3f45"`);
    }
}
