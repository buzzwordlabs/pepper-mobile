import { MigrationInterface, QueryRunner } from 'typeorm';

export class first1573518948761 implements MigrationInterface {
  name = 'first1573518948761';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "users_platform_enum" AS ENUM('android', 'ios')`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNum" character varying, "resetPasswordToken" integer, "resetPasswordExpires" integer, "safelist" jsonb NOT NULL DEFAULT '{}', "contacts" jsonb NOT NULL DEFAULT '{}', "onboardingStep" integer NOT NULL, "platform" "users_platform_enum", "appleDeviceToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f5fd4c312d689a81eb33ad5a00" ON "users" ("phoneNum") `,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "calls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apiVersion" character varying, "callStatus" character varying, "accountSid" character varying, "callSid" character varying, "called" character varying NOT NULL, "calledCity" character varying, "calledCountry" character varying, "calledVia" character varying, "calledZip" character varying, "caller" character varying, "callerCity" character varying, "callerCountry" character varying, "callerState" character varying, "calledState" character varying, "callerZip" character varying, "dialCallStatus" character varying, "direction" character varying, "from" character varying, "forwardedFrom" character varying, "fromCity" character varying, "fromCountry" character varying, "fromState" character varying, "fromZip" character varying, "to" character varying, "toCity" character varying, "toCountry" character varying, "toState" character varying, "toZip" character varying, "incoming" boolean, "answered" boolean, "failedPrompt" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_d9171d91f8dd1a649659f1b6a20" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8fa72c7e9c20cf08aa141f823" ON "calls" ("userId") `,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "faqs" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "answer" character varying NOT NULL, CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "platform" character varying NOT NULL, "environment" character varying NOT NULL, "origTxId" character varying NOT NULL, "validationResponse" character varying NOT NULL, "latestReceipt" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "productId" character varying NOT NULL, "isCancelled" boolean NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c29c9f42406de798d95bf68c0f9" UNIQUE ("origTxId"), CONSTRAINT "REL_fbdba4e2ac694cf8c9cecf4dc8" UNIQUE ("userId"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fbdba4e2ac694cf8c9cecf4dc8" ON "subscriptions" ("userId") `,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD CONSTRAINT "FK_c8fa72c7e9c20cf08aa141f8232" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" DROP CONSTRAINT "FK_c8fa72c7e9c20cf08aa141f8232"`,
      undefined
    );
    await queryRunner.query(
      `DROP INDEX "IDX_fbdba4e2ac694cf8c9cecf4dc8"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`, undefined);
    await queryRunner.query(`DROP TABLE "faqs"`, undefined);
    await queryRunner.query(
      `DROP INDEX "IDX_c8fa72c7e9c20cf08aa141f823"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "calls"`, undefined);
    await queryRunner.query(
      `DROP INDEX "IDX_f5fd4c312d689a81eb33ad5a00"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "users"`, undefined);
    await queryRunner.query(`DROP TYPE "users_platform_enum"`, undefined);
  }
}
