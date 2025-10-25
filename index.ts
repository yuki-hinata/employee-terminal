import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 再帰関数を使って、ユーザーがQやexitで抜けたとき以外は終了しないように実装する
// これだと実行回数分、入力した文が表示される
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
        const employee = await prisma.employee.findFirst({
          where: {
            name: { contains: name },
          },
        });
        console.log(employee ?? "該当者がいません。");
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
