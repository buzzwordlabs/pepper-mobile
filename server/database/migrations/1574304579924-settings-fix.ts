import { MigrationInterface, QueryRunner } from 'typeorm';

export class settingsFix1574304579924 implements MigrationInterface {
  name = 'settingsFix1574304579924';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{"robocallPN":false}'`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{}'`,
      undefined
    );
  }
}
