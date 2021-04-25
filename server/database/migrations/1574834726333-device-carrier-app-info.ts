import { MigrationInterface, QueryRunner } from 'typeorm';

export class deviceCarrierAppInfo1574834726333 implements MigrationInterface {
  name = 'deviceCarrierAppInfo1574834726333';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "carrier" character varying`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deviceInfo" jsonb NOT NULL DEFAULT '{}'`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "appVersion" character varying`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "appVersion"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "deviceInfo"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "carrier"`,
      undefined
    );
  }
}
