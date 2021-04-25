import { MigrationInterface, QueryRunner } from 'typeorm';

export class callfeedback1577058241380 implements MigrationInterface {
  name = 'callfeedback1577058241380';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "callQualityDescription" character varying`,
      undefined
    );
    await queryRunner.query(
      `CREATE TYPE "calls_callquality_enum" AS ENUM('good', 'bad', 'robocall')`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "callQuality" "calls_callquality_enum"`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "callQuality"`,
      undefined
    );
    await queryRunner.query(`DROP TYPE "calls_callquality_enum"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "callQualityDescription"`,
      undefined
    );
  }
}
