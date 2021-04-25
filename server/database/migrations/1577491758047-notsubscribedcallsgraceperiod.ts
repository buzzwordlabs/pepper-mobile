import { MigrationInterface, QueryRunner } from 'typeorm';

export class notsubscribedcallsgraceperiod1577491758047
  implements MigrationInterface {
  name = 'notsubscribedcallsgraceperiod1577491758047';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "notSubscribedCalls" TO "notSubscribedGracePeriod"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notSubscribedGracePeriod"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notSubscribedGracePeriod" TIMESTAMP`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notSubscribedGracePeriod"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notSubscribedGracePeriod" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "notSubscribedGracePeriod" TO "notSubscribedCalls"`,
      undefined
    );
  }
}
