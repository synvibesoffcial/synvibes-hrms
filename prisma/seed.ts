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
    await prisma.employee.create({
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
        teamId: teams[Math.floor(Math.random() * teams.length)].id,
      },
    });
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