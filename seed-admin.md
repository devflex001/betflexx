# Seeding Admin Users

This guide explains how to promote a registered user to an administrator in your Convex development and production environments.

---

## Prerequisites

1. **User Registration**: The user must already exist in your Convex database. 
   - Sign up the user first via your application interface using their phone number.
   - Note that the application formats and stores phone numbers in the international format (e.g. `+254712345678` instead of `0712345678`).
2. **Secret Configuration**: Ensure you have an `ADMIN_SEED_SECRET` defined in your local environment file (`.env.local`).

---

## Step-by-Step Instructions

### Step 1: Sync the Admin Secret with Convex
Convex runs in its own isolated server environment. You need to configure the `ADMIN_SEED_SECRET` on your Convex deployment so the database mutation can authorize your script request. 

1. Open your `.env.local` file and find the value of `ADMIN_SEED_SECRET`.
2. Set this environment variable in Convex by running:
   ```bash
   npx convex env set ADMIN_SEED_SECRET <your_secret_value>
   ```

*Note: You only need to run this command once (or whenever you change the secret key in `.env.local`).*

---

### Step 2: Run the Seeding Script
Run the seeding command in your terminal, passing the user's registered phone number as an argument. The script accepts standard formats (e.g., starting with `07` or `01`) as well as international formats (`+254`):

```bash
pnpm seed:admin <phone_number>
```

**Examples:**
```bash
pnpm seed:admin 0712345678
pnpm seed:admin 0112345678
pnpm seed:admin +254712345678
```

On success, you will see:
```text
Admin seeded successfully: { success: true }
```

---

## Troubleshooting Common Errors

### 1. `Uncaught Error: Invalid seed secret`
* **Cause**: The secret key your script sent does not match the `ADMIN_SEED_SECRET` set in your Convex deployment.
* **Solution**: Ensure your `.env.local` contains the correct secret, and push it to Convex again:
  ```bash
  npx convex env set ADMIN_SEED_SECRET <secret_from_env_local>
  ```

### 2. `Uncaught Error: No user found with phone 07XXXXXXXX`
* **Cause**: The phone number you passed does not exist in the Convex `users` database, or was passed in the wrong format.
* **Solution**:
  1. Confirm the user has registered in the app.
  2. Verify how the phone number is stored in the database. (Convex normalizes Kenyan numbers to `+254...`, so make sure you include the `+254` prefix when seeding).
