## Getting Started

Follow these steps to set up and run the project:

1. **Clone or fork the repository**
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy `.env.example` to `.env` and configure your environment variables.

4. Run database migrations:
    ```bash
    npx prisma migrate dev --name <migration-name>
    ```
    > Refer to the [Prisma documentation](https://www.prisma.io/docs/) if you encounter any issues.

5. Start the development server:
    ```bash
    npm run dev
    ```

### Additional Notes

- To seed data into the database, use `tsx` instead of `ts-node`.
- For any issues or questions, consult the project documentation or reach out to the maintainers.
### Key Features

- **Form Handling & Validation:** Utilizes `react-hook-form` for efficient form management, with schema validation powered by `zod`.
- **Session Management:** Implements secure session handling using `jose` and `bcrypt`, following best practices from the Next.js authentication documentation (App Router).
- **Email Verification:** Supports email verification during signup, leveraging `nodemailer` for transactional email delivery.
- **Password Recovery:** Includes a "Forgot Password" feature to allow users to securely reset their passwords.

