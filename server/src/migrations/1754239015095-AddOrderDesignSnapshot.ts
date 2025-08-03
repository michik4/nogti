import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDesignSnapshot1754239015162 implements MigrationInterface {
    name = 'AddOrderDesignSnapshot1754239015162';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_design_snapshots_type_enum" AS ENUM('basic', 'designer')`);
        await queryRunner.query(`CREATE TYPE "public"."order_design_snapshots_source_enum" AS ENUM('admin', 'client', 'master')`);
        await queryRunner.query(`CREATE TABLE "order_design_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "imageUrl" character varying(500) NOT NULL, "videoUrl" character varying(500), "type" "public"."order_design_snapshots_type_enum" NOT NULL DEFAULT 'basic', "source" "public"."order_design_snapshots_source_enum" NOT NULL, "tags" json, "color" character varying(100), "estimatedPrice" numeric(10,2), "originalDesignId" character varying(255), "authorName" character varying(255), "authorId" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f2a4797dc108e3464bbaee3f966" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "designSnapshotId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_0c25c9dbf4dc7ab49c17dea7488" FOREIGN KEY ("designSnapshotId") REFERENCES "order_design_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE "public"."order_design_snapshots_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_design_snapshots_source_enum"`);
        await queryRunner.query(`DROP TABLE "order_design_snapshots"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "designSnapshotId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_0c25c9dbf4dc7ab49c17dea7488"`);
    }
}
