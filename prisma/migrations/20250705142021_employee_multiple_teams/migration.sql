/*
  Warnings:

  - You are about to drop the column `teamId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_teamId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "teamId";

-- CreateTable
CREATE TABLE "EmployeeTeam" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTeam_employeeId_teamId_key" ON "EmployeeTeam"("employeeId", "teamId");

-- AddForeignKey
ALTER TABLE "EmployeeTeam" ADD CONSTRAINT "EmployeeTeam_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTeam" ADD CONSTRAINT "EmployeeTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
