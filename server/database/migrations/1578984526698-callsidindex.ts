import { MigrationInterface, QueryRunner } from 'typeorm';

export class callsidindex1578984526698 implements MigrationInterface {
  name = 'callsidindex1578984526698';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE INDEX "IDX_43b80aa9c9ecadf73188b12c1e" ON "calls" ("callSid") `,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "IDX_43b80aa9c9ecadf73188b12c1e"`,
      undefined
    );
  }
}
