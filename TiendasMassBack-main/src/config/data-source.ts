import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const isCompiled = __dirname.includes("dist");

export const AppDataSource = new DataSource({
  type: "mysql",
  host:  "localhost",
  port:  3306,
  username:  "root",
  password:  "Jake170702",
  database:  "tiendasmass",
  synchronize: false,
  logging: false,
  entities: [isCompiled ? "dist/entities/**/*.js" : "src/entities/**/*.ts"],
});
