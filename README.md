# Online Fuel Delivery App

Full-stack web application for fuel booking and mechanic assistance.

## Tech Stack
- Frontend: React (CRA)
- Backend: Flask
- Database: MongoDB

## Folder Structure
```
fuel app/
  backend/
    app.py
    config.py
    database.py
    models.py
    requirements.txt
    routes/
      auth.py
      booking.py
      mechanic.py
    utils/
      auth.py
      otp.py
  frontend/
    package.json
    public/
      index.html
    src/
      api.js
      App.js
      index.js
      styles.css
      pages/
        LoginPage.js
        OtpVerifyPage.js
        DashboardPage.js
        FuelBookingPage.js
        MechanicAssistancePage.js
```

## Features
- Login with simulated OTP
- Fuel booking form with camera capture image
- Mechanic assistance request form
- Booking and assistance history for logged-in user

## Backend Setup (Flask)
1. Open terminal in `backend`.
2. Create virtual environment:
   - Windows: `python -m venv venv`
3. Activate environment:
   - Windows: `venv\\Scripts\\activate`
4. Install dependencies:
   - `pip install -r requirements.txt`
5. Start MongoDB locally (default: `mongodb://127.0.0.1:27017/`).
6. Run backend:
   - `python app.py`

Optional environment variables:
- `MONGO_URI` (default `mongodb://127.0.0.1:27017/`)
- `MONGO_DB_NAME` (default `fuel_delivery_app`)
- `SECRET_KEY` (optional)

Backend runs at `http://localhost:5000`.

## Frontend Setup (React)
1. Open terminal in `frontend`.
2. Install dependencies:
   - `npm install`
3. Start frontend:
   - `npm start`

Frontend runs at `http://localhost:3000` and calls backend at `http://localhost:5000/api`.

Optional frontend env:
- `REACT_APP_API_URL` (e.g. `http://localhost:5000/api`)

## API Endpoints
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/bookings/` (auth required)
- `GET /api/bookings/my` (auth required)
- `POST /api/mechanic/request` (auth required)
- `GET /api/mechanic/my` (auth required)

## Notes
- OTP is simulated and returned directly in response for demo/testing.
- Camera capture requires browser permission and HTTPS in strict browser contexts (localhost is usually allowed).
