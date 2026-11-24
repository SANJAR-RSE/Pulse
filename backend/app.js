const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const telegramRoutes = require('./routes/telegram.routes');
const healthRoutes = require('./routes/health.routes');
const clinicRoutes = require('./routes/clinic.routes');
const departmentRoutes = require('./routes/department.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const queueRoutes = require('./routes/queue.routes');
const doctorPanelRoutes = require('./routes/doctorPanel.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const notificationRoutes = require('./routes/notification.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health-check', (req, res) => res.json({ ok: true, service: 'PULSE backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/doctor-panel', doctorPanelRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
