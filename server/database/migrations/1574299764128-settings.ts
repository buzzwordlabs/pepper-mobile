import { MigrationInterface, QueryRunner } from 'typeorm';

export class settings1574299764128 implements MigrationInterface {
  name = 'settings1574299764128';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "settings" jsonb NOT NULL DEFAULT '{}'`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "settings"`,
      undefined
    );
  }
}
