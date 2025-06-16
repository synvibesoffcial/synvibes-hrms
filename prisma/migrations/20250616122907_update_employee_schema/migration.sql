/*
  Warnings:

  - A unique constraint covering the columns `[empId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemRole` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "empId" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "systemRole" "Role" NOT NULL;

-- Optionally fill in default or placeholder values here.
UPDATE "Employee" SET
  "empId" = 'EMP001',
  "systemRole" = 'employee',
  "firstName" = 'Neston',
  "lastName" = 'Cabral',
  "dateOfBirth" = '2003-09-12',
  "gender" = 'male';

-- CreateIndex
CREATE UNIQUE INDEX "Employee_empId_key" ON "Employee"("empId");
