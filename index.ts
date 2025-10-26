import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { PrismaClient, type Employee } from '@prisma/client';
import { createClient } from 'redis';

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
        const name = await rl.question("名前を入力して下さい: ");

        if (!name.trim()) {
          console.log("空文字での入力はできません。再度入力してください。");
          rl.prompt();
          return;
        }

        const escapedName = escapeLikePattern(name.trim());

        const cachedEmployees = await redis.get(`name_search_cache:${escapedName}`);
        if (cachedEmployees) {
          console.log('キャッシュから取得しました。');
          console.log(JSON.parse(cachedEmployees));
          rl.prompt();
          return;
        }

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

        if (employee.length > 0) {
          console.log('キャッシュに保存しました。');
          await redis.set(`name_search_cache:${escapedName}`, JSON.stringify(employee));
        }

        console.log(employee.length > 0 ? employee.map(formatEmployee).join("\n") : "該当者がいません。");
        rl.prompt();
        break;
      case "Y":
          const yearsOfService = await rl.question("絞り込みたい勤続年数を入力して下さい(x年以上): ");
          if (!yearsOfService.trim()) {
            console.log("空文字での入力はできません。再度入力してください。");
            rl.prompt();
            return;
          }
          const employees = await prisma.employee.findMany({
            select: {
              id: true,
              name: true,
              yearsOfService: true,
              position: true,
            },
            where: { yearsOfService: { gte: parseInt(yearsOfService.trim()) } },
          });
          console.log(employees.length > 0 ? employees.map(formatEmployee).join("\n") : "該当者がいません。");
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
