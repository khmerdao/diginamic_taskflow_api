import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueCategoryNameUser1773149126580 implements MigrationInterface {
    name = 'AddUniqueCategoryNameUser1773149126580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_48f0690983e955b500b4a3e029\` ON \`categories\` (\`name\`, \`user_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_48f0690983e955b500b4a3e029\` ON \`categories\``);
    }

}
