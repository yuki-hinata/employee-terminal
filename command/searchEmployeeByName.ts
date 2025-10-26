import type { PrismaClient } from "@prisma/client";
import { escapeLikePattern } from "../utils/escapeLikePattern.ts";
import { formatEmployee } from "../utils/formatEmployee.ts";
import type { createClient } from "redis";
import type * as readline from 'node:readline/promises';

type Props = {
  rl: readline.Interface;
  redis: ReturnType<typeof createClient>;
  prisma: PrismaClient;
}

export const searchEmployeeByName = async ({ rl, redis, prisma }: Props) => {
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
}
