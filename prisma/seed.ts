import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Departments
  const departments = [];
  for (let i = 0; i < 3; i++) {
    const dept = await prisma.department.create({
      data: {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
      },
    });
    departments.push(dept);
  }

  // Create Teams
  const teams = [];
  for (const dept of departments) {
    for (let i = 0; i < 2; i++) {
      const team = await prisma.team.create({
        data: {
          name: `${faker.hacker.noun()} Team`,
          description: faker.lorem.sentence(),
          departmentId: dept.id,
        },
      });
      teams.push(team);
    }
  }

  // Create Users and Employees
  const employees = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        password: faker.internet.password(), // In production, hash passwords
        firstName,
        lastName,
        role: 'employee',
      },
    });

    // Create Employee
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        empId: `EMP${1000 + i}`,
        firstName,
        lastName,
        joinDate: faker.date.past(),
        dateOfBirth: faker.date.birthdate(),
        gender: faker.person.sexType(),
        address: faker.location.streetAddress(),
        contactInfo: faker.phone.number(),
      },
    });

    employees.push(employee);
  }

  // Create EmployeeTeam relationships
  for (const employee of employees) {
    // Each employee joins at least one team
    const primaryTeam = teams[Math.floor(Math.random() * teams.length)];
    await (prisma as any).employeeTeam.create({
      data: {
        employeeId: employee.id,
        teamId: primaryTeam.id,
      },
    });

    // Some employees (30%) join a second team
    if (Math.random() < 0.3) {
      const availableTeams = teams.filter(team => team.id !== primaryTeam.id);
      if (availableTeams.length > 0) {
        const secondaryTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        await (prisma as any).employeeTeam.create({
          data: {
            employeeId: employee.id,
            teamId: secondaryTeam.id,
          },
        });
      }
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });