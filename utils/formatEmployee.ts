import type { Employee } from "@prisma/client";

export const formatEmployee = (employee: Omit<Employee, "createdAt" | "updatedAt">): string => {
  return `ID: ${employee.id} 名前: ${employee.name} 勤続年数: ${employee.yearsOfService}年 役職: ${employee.position}`;
};
