import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1751308912728 implements MigrationInterface {
    name = 'InitMigration1751308912728';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(255) NOT NULL, "isGuest" boolean NOT NULL DEFAULT true, "blocked" boolean NOT NULL DEFAULT false, "avatar_url" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fullName" character varying(255), "phone" character varying(20), "permissions" json, "isActive" boolean DEFAULT true, "latitude" numeric(10,8), "longitude" numeric(11,8), "address" character varying(500), "description" text, "rating" numeric(2,1) DEFAULT '0', "totalOrders" integer DEFAULT '0', "isModerated" boolean DEFAULT false, "reviewsCount" integer DEFAULT '0', "specialties" text, "startingPrice" numeric(10,2), "type" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type") `);
        await queryRunner.query(`CREATE TABLE "master_designs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customPrice" numeric(10,2), "notes" text, "estimatedDuration" integer, "isActive" boolean NOT NULL DEFAULT true, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "nailMasterId" uuid, "nailDesignId" uuid, CONSTRAINT "PK_b3b87b9947a4f9dd1f278ae7ae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."nail_designs_type_enum" AS ENUM('basic', 'designer')`);
        await queryRunner.query(`CREATE TYPE "public"."nail_designs_source_enum" AS ENUM('admin', 'client', 'master')`);
        await queryRunner.query(`CREATE TABLE "nail_designs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "imageUrl" character varying(500) NOT NULL, "videoUrl" character varying(500), "type" "public"."nail_designs_type_enum" NOT NULL DEFAULT 'basic', "source" "public"."nail_designs_source_enum" NOT NULL, "tags" json, "color" character varying(100), "estimatedPrice" numeric(10,2), "likesCount" integer NOT NULL DEFAULT '0', "ordersCount" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "isModerated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uploadedByClientId" uuid, "uploadedByAdminId" uuid, CONSTRAINT "PK_e2d815e31029394b482b90dce6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'alternative_proposed', 'declined', 'timeout', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "price" numeric(10,2), "requestedDateTime" TIMESTAMP NOT NULL, "proposedDateTime" TIMESTAMP, "confirmedDateTime" TIMESTAMP, "masterNotes" text, "clientNotes" text, "masterResponseTime" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "clientId" uuid, "nailMasterId" uuid, "nailDesignId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedules_status_enum" AS ENUM('available', 'booked', 'blocked')`);
        await queryRunner.query(`CREATE TABLE "schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workDate" date NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "status" "public"."schedules_status_enum" NOT NULL DEFAULT 'available', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "nailMasterId" uuid, CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "master_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "duration" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "masterId" uuid, CONSTRAINT "PK_26d88d1b0d6d741d9c899b7f248" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text NOT NULL, "rating" integer, "imageUrl" character varying(500), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "clientId" uuid, "nailDesignId" uuid, "nailMasterId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_liked_designs" ("clientId" uuid NOT NULL, "nailDesignId" uuid NOT NULL, CONSTRAINT "PK_79f4d62b088fc6d8103b4429609" PRIMARY KEY ("clientId", "nailDesignId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_887702a3f35fd5f2aef3181e12" ON "client_liked_designs" ("clientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5382f52296f262aab40b90709c" ON "client_liked_designs" ("nailDesignId") `);
        await queryRunner.query(`ALTER TABLE "master_designs" ADD CONSTRAINT "FK_5444db31ea68f7bbfdb5101f94f" FOREIGN KEY ("nailMasterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_designs" ADD CONSTRAINT "FK_0193788fcb0715e6e29761198c4" FOREIGN KEY ("nailDesignId") REFERENCES "nail_designs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nail_designs" ADD CONSTRAINT "FK_39a4f4f16b79c4c4cba3721ce86" FOREIGN KEY ("uploadedByClientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nail_designs" ADD CONSTRAINT "FK_94ec28ca9841c617d6252a41e05" FOREIGN KEY ("uploadedByAdminId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_c4361bcf2e7010b19d2649dfd7d" FOREIGN KEY ("nailMasterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_30d92b21a3a0f73906bfa93e1e8" FOREIGN KEY ("nailDesignId") REFERENCES "nail_designs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_7be3a18df7526228546040c4e2c" FOREIGN KEY ("nailMasterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_services" ADD CONSTRAINT "FK_e929bb7a400d6f4cfc7240749a1" FOREIGN KEY ("masterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_8bf30713187361f910f8fb3c2c1" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_07c44f387d06706df02db42c3e2" FOREIGN KEY ("nailDesignId") REFERENCES "nail_designs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_4510283f57f9ddef47ca80ccab2" FOREIGN KEY ("nailMasterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_liked_designs" ADD CONSTRAINT "FK_887702a3f35fd5f2aef3181e124" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "client_liked_designs" ADD CONSTRAINT "FK_5382f52296f262aab40b90709c3" FOREIGN KEY ("nailDesignId") REFERENCES "nail_designs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94e2000b5f7ee1f9c491f0f8a8"`);
        await queryRunner.query(`DROP TABLE "master_designs"`);
        await queryRunner.query(`DROP TYPE "public"."nail_designs_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nail_designs_source_enum"`);
        await queryRunner.query(`DROP TABLE "nail_designs"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."schedules_status_enum"`);
        await queryRunner.query(`DROP TABLE "schedules"`);
        await queryRunner.query(`DROP TABLE "master_services"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "client_liked_designs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_887702a3f35fd5f2aef3181e12"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5382f52296f262aab40b90709c"`);
        await queryRunner.query(`ALTER TABLE "master_designs" DROP CONSTRAINT "FK_5444db31ea68f7bbfdb5101f94f"`);
        await queryRunner.query(`ALTER TABLE "master_designs" DROP CONSTRAINT "FK_0193788fcb0715e6e29761198c4"`);
        await queryRunner.query(`ALTER TABLE "nail_designs" DROP CONSTRAINT "FK_39a4f4f16b79c4c4cba3721ce86"`);
        await queryRunner.query(`ALTER TABLE "nail_designs" DROP CONSTRAINT "FK_94ec28ca9841c617d6252a41e05"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1457f286d91f271313fded23e53"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_c4361bcf2e7010b19d2649dfd7d"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_30d92b21a3a0f73906bfa93e1e8"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_7be3a18df7526228546040c4e2c"`);
        await queryRunner.query(`ALTER TABLE "master_services" DROP CONSTRAINT "FK_e929bb7a400d6f4cfc7240749a1"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_8bf30713187361f910f8fb3c2c1"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_07c44f387d06706df02db42c3e2"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_4510283f57f9ddef47ca80ccab2"`);
        await queryRunner.query(`ALTER TABLE "client_liked_designs" DROP CONSTRAINT "FK_887702a3f35fd5f2aef3181e124"`);
        await queryRunner.query(`ALTER TABLE "client_liked_designs" DROP CONSTRAINT "FK_5382f52296f262aab40b90709c3"`);
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
    }
}
