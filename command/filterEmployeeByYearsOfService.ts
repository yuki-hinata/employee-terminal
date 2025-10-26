import type { PrismaClient } from "@prisma/client";
import type { createClient } from "redis";
import { formatEmployee } from "../utils/formatEmployee.ts";
import type * as readline from 'node:readline/promises';

type Props = {
  rl: readline.Interface;
  redis: ReturnType<typeof createClient>;
  prisma: PrismaClient;
}

export const filterEmployeeByYearsOfService = async ({ rl, redis, prisma }: Props) => {
  const yearsOfService = await rl.question("絞り込みたい勤続年数を入力して下さい(x年以上): ");
  if (!yearsOfService.trim()) {
    console.log("空文字での入力はできません。再度入力してください。");
    rl.prompt();
    return;
  }

  const cachedYearsOfService = await redis.get(`years_of_service_search_cache:${yearsOfService.trim()}`);
  if (cachedYearsOfService) {
    console.log(JSON.parse(cachedYearsOfService).map(formatEmployee).join("\n"));
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

  if (employees.length > 0) {
    await redis.set(`years_of_service_search_cache:${yearsOfService.trim()}`, JSON.stringify(employees), {
      // 社員の更新頻度はそこまで高くないと仮定して、30分キャッシュする
      EX: 1800,
      NX: true
    });
  }

  console.log(employees.length > 0 ? employees.map(formatEmployee).join("\n") : "該当者がいません。");
  rl.prompt();
}
