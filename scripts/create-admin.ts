import fs from "node:fs";
import readline from "node:readline";
import { Writable } from "node:stream";
import mongoose from "mongoose";

// Env yalnız .env.local-dan oxunur (Next.js-in özü kimi); fayl yoxdursa mühit dəyişənlərindən
if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

let muted = false;

// Şifrə yazılanda terminalda göstərilməsin deyə çıxış müvəqqəti susdurulur
const output = new Writable({
  write(chunk: Buffer, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY),
});

// Bütün sətirlər bir interfeysdən növbəyə yığılır ki, heç biri itməsin
const lines: string[] = [];
const waiters: Array<(line: string) => void> = [];

rl.on("line", (line) => {
  const waiter = waiters.shift();
  if (waiter) waiter(line);
  else lines.push(line);
});

const nextLine = (): Promise<string> => {
  const line = lines.shift();
  return line !== undefined ? Promise.resolve(line) : new Promise((resolve) => waiters.push(resolve));
};

const ask = async (question: string, hidden = false): Promise<string> => {
  process.stdout.write(question);
  muted = hidden;

  const answer = await nextLine();

  muted = false;
  if (hidden) process.stdout.write("\n");

  return answer;
};

const run = async (): Promise<void> => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_SETUP !== "true") {
    throw new Error("Admin setup is disabled in production (set ALLOW_ADMIN_SETUP=true temporarily)");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env.local");
  }

  // Env yüklənəndən sonra import edilir (modellər env-dən asılı konfiqurasiya oxuyur)
  const { createAdminAccount } = await import("../backend/services/adminService");

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  const email = (await ask("Admin email: ")).trim();
  const password = await ask("Password: ", true);
  const confirmation = await ask("Confirm password: ", true);

  if (password !== confirmation) throw new Error("Passwords do not match");

  const admin = await createAdminAccount(email, password);

  console.log(`Admin created: ${admin.email}`);
};

run()
  .catch((error: Error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await mongoose.disconnect();
  });
