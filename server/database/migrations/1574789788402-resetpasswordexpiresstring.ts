import { MigrationInterface, QueryRunner } from 'typeorm';

export class resetpasswordexpiresstring1574789788402
  implements MigrationInterface {
  name = 'resetpasswordexpiresstring1574789788402';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "resetPasswordExpires" character varying`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "resetPasswordExpires" integer`,
      undefined
    );
  }
}
