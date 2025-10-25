import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  const result = await rl.question("操作を選択して下さい: [N]名前検索 [Y]勤続年数 [Q]システム終了\n");
  if (result === "N") {
    const employee = await prisma.employee.findMany();
    console.log(employee);
    console.log("名前検索を実行します。");
  } else if (result === "Y") {
    console.log("勤続年数を実行します。");
  } else if (result === "Q") {
    console.log("システムを終了します。");
    rl.close();
  } else {
    console.log("無効な操作です。");
    rl.close();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("プログラムを終了します。");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
