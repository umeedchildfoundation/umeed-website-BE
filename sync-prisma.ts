import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainSchemaPath: string = path.join(__dirname, "prisma", "schema.prisma");
const modelsDir: string = path.join(__dirname, "prisma", "models");

const baseSchema: string = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`;

const getAllPrismaFiles = (
  dirPath: string,
  fileArray: string[] = []
): string[] => {
  if (!fs.existsSync(dirPath)) {
    return fileArray;
  }
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllPrismaFiles(fullPath, fileArray);
    } else if (file.endsWith(".prisma")) {
      fileArray.push(fullPath);
    }
  });
  return fileArray;
};

let finalSchema = baseSchema;
const allModelFiles = getAllPrismaFiles(modelsDir);

for (const file of allModelFiles) {
  const content = fs.readFileSync(file, "utf-8");
  finalSchema += "\n" + content;
}

if (!fs.existsSync(path.dirname(mainSchemaPath))) {
  fs.mkdirSync(path.dirname(mainSchemaPath), { recursive: true });
}
fs.writeFileSync(mainSchemaPath, finalSchema);
console.log("✅ Prisma schema synced successfully!");
