# PakiApps Combined FE With BE Signup Login

This repository bundles the mobile signup/login frontend workspaces together with the NestJS backend that handles auth and Supabase access.

## Included Projects

- `backend/` - NestJS API used by the mobile apps
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/` - mobile frontend workspace
- `frontend/.../pakiShip_Signup-main/` - signup app
- `frontend/.../pakiShip_Login-main/` - login app

## Environment Files

The required `.env` and `.env.example` files for backend, signup, and login are already included in this repository.

Committed env files:

- `backend/.env`
- `backend/.env.example`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/.env`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/.env.example`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/pakiShip_Login-main/.env`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/pakiShip_Login-main/.env.example`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/pakiShip_Signup-main/.env`
- `frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main/pakiShip_Signup-main/.env.example`

## How To Run

Open two terminals.

### 1. Start the backend

```powershell
cd backend
npm install
npm run start:dev
```

The backend runs on:

```text
http://localhost:3000
```

The API base path used by the mobile apps is:

```text
http://localhost:3000/api/v1
```

### 2. Start the signup frontend

```powershell
cd frontend/pakiAPPS-main-pakiapps-frontend-ver2/pakiapps-frontend/pakiship-fe/pakiship_mobile_fe-main
npm install --legacy-peer-deps
npm run start:signup
```

### 3. Start the login frontend

From the same frontend workspace:

```powershell
npm run install:login
npm run start:login
```

## Quick Start Summary

If you only want signup:

1. Start `backend/`
2. Start `pakiship_mobile_fe-main`
3. Run `npm run start:signup`

If you only want login:

1. Start `backend/`
2. Start `pakiship_mobile_fe-main`
3. Run `npm run start:login`

## Device Notes

- On the same machine, the frontend is configured to call `http://127.0.0.1:3000/api/v1`
- On a real phone, replace the frontend API base URL with your computer's LAN IP, for example `http://192.168.1.20:3000/api/v1`
- Signup/login is wired as `frontend -> backend -> Supabase`
