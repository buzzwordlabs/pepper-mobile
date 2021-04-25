import { MigrationInterface, QueryRunner } from 'typeorm';

export class uglycalls1576915489264 implements MigrationInterface {
  name = 'uglycalls1576915489264';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "uglycalls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apiVersion" character varying, "callStatus" character varying, "accountSid" character varying, "callSid" character varying, "called" character varying NOT NULL, "calledCity" character varying, "calledCountry" character varying, "calledVia" character varying, "calledZip" character varying, "caller" character varying, "callerCity" character varying, "callerCountry" character varying, "callerState" character varying, "calledState" character varying, "callerZip" character varying, "direction" character varying, "callDuration" integer, "from" character varying, "forwardedFrom" character varying, "fromCity" character varying, "fromCountry" character varying, "fromState" character varying, "fromZip" character varying, "to" character varying, "toCity" character varying, "toCountry" character varying, "toState" character varying, "toZip" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a07af0b5bdc8ccb53a4168d3648" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "isSubscribed" boolean NOT NULL DEFAULT true`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "isSubscribed"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "uglycalls"`, undefined);
  }
}
