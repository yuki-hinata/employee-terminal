import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient, type Employee } from '@prisma/client';

const prisma = new PrismaClient();

function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

function formatEmployee(employee: Omit<Employee, "createdAt" | "updatedAt">): string {
  return `ID: ${employee.id} 名前: ${employee.name} 勤続年数: ${employee.yearsOfService}年 役職: ${employee.position}`;
}

async function main() {
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
          console.log("空文字での入力はできません。再度入力してください。");
          rl.prompt();
          return;
        }

        const escapedName = escapeLikePattern(name.trim());
        const employee = await prisma.employee.findMany({
          select: {
            id: true,
            name: true,
            yearsOfService: true,
            position: true,
          },
          where: {
            name: { contains: escapedName },
          },
        });
        console.log(employee.length > 0 ? employee.map(formatEmployee).join("\n") : "該当者がいません。");
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

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
