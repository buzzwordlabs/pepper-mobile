import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedAtCalls1575954037628 implements MigrationInterface {
  name = 'updatedAtCalls1575954037628';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "calls" DROP COLUMN "updatedAt"`,
      undefined
    );
  }
}
