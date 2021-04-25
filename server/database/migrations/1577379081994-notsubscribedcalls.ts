import { MigrationInterface, QueryRunner } from 'typeorm';

export class notsubscribedcalls1577379081994 implements MigrationInterface {
  name = 'notsubscribedcalls1577379081994';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notSubscribedCalls" integer`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notSubscribedCalls"`,
      undefined
    );
  }
}
