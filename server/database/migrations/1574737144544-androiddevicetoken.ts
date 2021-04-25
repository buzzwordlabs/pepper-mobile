import { MigrationInterface, QueryRunner } from 'typeorm';

export class androiddevicetoken1574737144544 implements MigrationInterface {
  name = 'androiddevicetoken1574737144544';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "androidDeviceToken" character varying`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "androidDeviceToken"`,
      undefined
    );
  }
}
