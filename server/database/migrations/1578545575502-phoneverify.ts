import { MigrationInterface, QueryRunner } from 'typeorm';

export class phoneverify1578545575502 implements MigrationInterface {
  name = 'phoneverify1578545575502';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phoneNumVerifyCode" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phoneNumVerifyCodeExpires" TIMESTAMP`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "resetPasswordExpires" TIMESTAMP`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "resetPasswordExpires" character varying`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "phoneNumVerifyCodeExpires"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "phoneNumVerifyCode"`,
      undefined
    );
  }
}
