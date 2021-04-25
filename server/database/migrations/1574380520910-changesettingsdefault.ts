import { MigrationInterface, QueryRunner } from 'typeorm';

export class changesettingsdefault1574380520910 implements MigrationInterface {
  name = 'changesettingsdefault1574380520910';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{}'`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{"robocallPN": false}'`,
      undefined
    );
  }
}
