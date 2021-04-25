import { MigrationInterface, QueryRunner } from 'typeorm';

export class answeredandprompted1577082856933 implements MigrationInterface {
  name = 'answeredandprompted1577082856933';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "answered"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "wasAnswered" boolean`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "wasPrompted" boolean`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "wasPrompted"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "wasAnswered"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "answered" boolean`,
      undefined
    );
  }
}
