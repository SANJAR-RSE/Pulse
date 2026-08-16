# PULSE backend API contract

Base URL (local dev): `http://localhost:4000/api`

Auth: `Authorization: Bearer <jwt>` header (from `/auth/login` or `/auth/register`).
Bot-internal auth (no JWT): headers `x-bot-secret: <BOT_INTERNAL_SECRET>` + `x-telegram-id: <telegram user id>` — resolves to the linked PULSE user. Returns 404 `{error:"TAYINLANMAGANSIZ"}` if not linked yet.

All error responses: `{ "error": "human-readable Uzbek message" }` with an appropriate 4xx/5xx status.

## Auth
- `POST /auth/register` `{name,email,password}` → `201 {token, user}`
- `POST /auth/login` `{email,password}` → `200 {token, user}`
- `GET /auth/me` (auth) → `{user}`
- `user = {id, name, email, role: "patient"|"doctor"|"admin", telegramLinked: bool}`

## Telegram linking
- `POST /telegram/link-code` (auth, web user) → `{code, deepLink}` — deep link opens `https://t.me/<bot>?start=<code>`
- `POST /telegram/connect` (bot-secret only, no telegram-id header needed) body `{code, telegramId, chatId}` → `{linked: true, name}`

## Health (all require auth)
- `GET /health/dashboard` → `{water:{consumedMl,goalMl}, sleep:{durationMinutes}|null, workout:{totalMinutes}, medication:{taken,total}, nextAppointment:{...}|null, queue:{code,status,aheadCount,estimatedWaitMinutes}|null, healthScore}`
- `GET /health/statistics` → `{waterLiters, sleepHours, workoutSessions, medicationAdherence, appointments, queueAverageMinutes}`
- `GET/POST /health/water` — POST body `{amountMl}`
- `GET/POST /health/sleep` — POST body `{sleepTime:"HH:mm", wakeTime:"HH:mm"}`
- `GET/POST /health/workouts` — POST body `{type, durationMinutes, calories?}`
- `GET/POST /health/medications` — POST body `{name, time:"HH:mm"}`; GET returns `{medications:[{...,takenToday}]}`
- `POST /health/medications/:id/taken`

## Clinics / Departments / Doctors (auth)
- `GET /clinics` → `{clinics}`
- `GET /clinics/:id` → `{clinic}`
- `GET /departments` → `{departments}`
- `GET /doctors?department=&clinic=` → `{doctors}` (each populated with `clinic`,`department`)
- `GET /doctors/:id` → `{doctor}`
- `GET /doctors/:id/slots?date=YYYY-MM-DD` → `{slots: ["09:00","09:30",...]}`

## Appointments & Queue (auth, patient)
- `POST /appointments` `{doctorId, date, time}` → `201 {appointment, queue}`
- `GET /appointments` → `{appointments}` (mine, populated)
- `PATCH /appointments/:id/cancel` → `{appointment}`
- `GET /queue/:appointmentId` → `{code, status: WAITING|NEAR|CALLED|COMPLETED|CANCELLED, aheadCount, estimatedWaitMinutes}`

## Doctor panel (auth, role=doctor)
- `GET /doctor-panel/queue?date=` → `{queue: [{...,patient:{name},appointment}]}` sorted by position
- `POST /doctor-panel/queue/next` `{date?}` → `{called, near}`
- `POST /doctor-panel/appointments/:id/complete` `{examination, recommendation?, labResults?:[{name,value,unit?,normalRange?}]}` → `201 {record}`

## Medical history (auth, patient — scoped to self)
- `GET /medical-records` → `{records}`

## Notifications (auth)
- `GET /notifications` → `{notifications}`
- `PATCH /notifications/:id/read`

## Emergency (auth)
- `GET /emergency` → `{contacts: [{name, phone, type, description}]}`

## PULSE AI (auth)
- `POST /ai/chat` `{message}` → `{reply, action: {type, ...}|null}` — action types: `view_doctors`, `book_appointment`, `view_queue`, `add_water`, `add_sleep`, `add_workout`, `view_medical_history`, `find_doctor`
- `GET /ai/history` → `{messages: [{role, content, createdAt}]}`

## Demo accounts (after `npm run seed`)
- Patient: `patient@pulse.demo` / `password123`
- Doctor: `doctor@pulse.demo` / `password123`
