import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

const all = async () => {
  const rl = readline.createInterface({
    input,
    output,
    prompt: "操作を選択して下さい: [N]名前検索 [Y]勤続年数 [Q]システム終了\n",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    switch (line) {
      case "N":
        const name = await rl.question("名前を入力して下さい: ");

        if (!name.trim()) {
          console.log("名前を入力してください。");
          rl.prompt();
          return;
        }

        const escapedName = escapeLikePattern(name.trim());
        const employee = await prisma.employee.findMany({
          where: {
            name: { contains: escapedName },
          },
        });
        console.log(employee.length > 0 ? employee : "該当者がいません。");
        rl.prompt();
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
}

async function main() {
  await all();
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
