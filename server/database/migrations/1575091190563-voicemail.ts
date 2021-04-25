import { MigrationInterface, QueryRunner } from 'typeorm';

export class voicemail1575091190563 implements MigrationInterface {
  name = 'voicemail1575091190563';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "voicemails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "isDeleted" boolean NOT NULL, "caller" character varying NOT NULL, "duration" integer NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73302c612477dd103d8dcc88060" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_677d0a96945c601a3c13b67aa1" ON "voicemails" ("userId") `,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "voicemails" ADD CONSTRAINT "FK_677d0a96945c601a3c13b67aa1a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "voicemails" DROP CONSTRAINT "FK_677d0a96945c601a3c13b67aa1a"`,
      undefined
    );
    await queryRunner.query(
      `DROP INDEX "IDX_677d0a96945c601a3c13b67aa1"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "voicemails"`, undefined);
  }
}
