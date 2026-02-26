# PlowingServiceBookingPlatform
Help property owners secure reliable snow removal when they need it most by making booking, scheduling, and service tracking effortless during winter storms


## Deployment (Render + Vercel)

- **Backend (Render)**  
  In the Render service, set **Environment** → `FRONTEND_URL` to your Vercel app URL (e.g. `https://your-app.vercel.app`). Use a comma-separated list if you have multiple origins (e.g. preview + production).

- **Frontend (Vercel)**  
  In the Vercel project, set **Environment Variables** → `REACT_APP_API_URL` to your Render API URL (e.g. `https://your-server.onrender.com`). Redeploy after adding it.

#onboarding
## Project Documentation
* [View Sprint 1 User Stories](ONBOARDING.md)