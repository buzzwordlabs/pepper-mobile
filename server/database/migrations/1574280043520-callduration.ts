import { MigrationInterface, QueryRunner } from 'typeorm';

export class callduration1574280043520 implements MigrationInterface {
  name = 'callduration1574280043520';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "callDuration" integer`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "callDuration"`,
      undefined
    );
  }
}
