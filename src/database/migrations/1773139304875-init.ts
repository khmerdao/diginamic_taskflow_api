import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1773139304875 implements MigrationInterface {
    name = 'Init1773139304875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`status\` enum ('todo', 'in_progress', 'done', 'cancelled') NOT NULL DEFAULT 'todo', \`priority\` enum ('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium', \`due_date\` date NULL, \`user_id\` int NOT NULL, \`category_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`color\` varchar(7) NOT NULL DEFAULT '#6366f1', \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL, \`email\` varchar(100) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_db55af84c226af9dce09487b61b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_d94d89c9ec19bc4470e3368c905\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_2296b7fe012d95646fa41921c8b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_2296b7fe012d95646fa41921c8b\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_d94d89c9ec19bc4470e3368c905\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_db55af84c226af9dce09487b61b\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`tasks\``);
    }

}
