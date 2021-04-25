import { MigrationInterface, QueryRunner } from 'typeorm';

export class codepushVersion1577160297673 implements MigrationInterface {
  name = 'codepushVersion1577160297673';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "codePushVersion" character varying`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "codePushVersion"`,
      undefined
    );
  }
}
