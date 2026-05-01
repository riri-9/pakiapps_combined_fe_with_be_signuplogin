# Garnet Backend

NestJS backend for the mobile auth flow.

## Run the backend

From this `backend/` folder:

```bash
npm install
npm run start:dev
```

Local backend URL:

```text
http://localhost:3000/api/v1
```

## Environment

Copy `.env.example` to `.env` inside this `backend/` folder and fill in your Supabase values.

## Notes

- The frontend UI is unchanged.
- Signup and login are the only flows that need to work first.
- This backend talks to Supabase; the mobile frontend only talks to this backend.

