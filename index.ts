import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { searchEmployeeByName } from './command/searchEmployeeByName.ts';
import { filterEmployeeByYearsOfService } from './command/filterEmployeeByYearsOfService.ts';

const prisma = new PrismaClient();

async function main() {
  const redis = await createClient({
    url: 'redis://redis:6379'
  }).on('error', (err) => console.error('Redis Error', err)).connect();

  const rl = readline.createInterface({
    input,
    output,
    prompt: "操作を選択して下さい: [N]名前検索 [Y]勤続年数 [Q]システム終了\n",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    switch (line) {
      case "N":
        await searchEmployeeByName({ rl, redis, prisma });
        break;
      case "Y":
        await filterEmployeeByYearsOfService({ rl, redis, prisma });
        break;
      case "Q":
        console.log("システムを終了します。");
        rl.close();
        break;
      default:
        console.log("該当するキーバインドがありません。再度入力してください。");
        rl.prompt();
    }
  });

  rl.on('close', async () => {
    await redis.quit();
    await prisma.$disconnect();
    process.exit(0);
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
