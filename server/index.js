import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './mongodb/Connect.js';
import cors from 'cors';
import authRoutes from './auth/Routes.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/user.js';
import roleRoutes from './routes/role.js';
import academicYearRoutes from './routes/academicYear.js';
import studentProfileRoutes from './routes/studentProfile.js';
import employeeProfileRoutes from './routes/employeeProfile.js';
import dengueMonitoringRoutes from './routes/dengueMonitoring.js';
import studentMedicalRoutes from './routes/studentMedical.js';
import medicineInventoryRoutes from './routes/medicineInventory.js';
import clinicVisitRoutes from './routes/clinicVisit.js';
// import logRoutes from './routes/log.js';
import employeeMedicalRoutes from './routes/employeeMedical.js';
import feedingProgramRoutes from './routes/feedingProgram.js';
import dewormingRoutes from './routes/deworming.js';
import resetPasswordRoutes from './routes/resetPassword.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://127.0.0.1:5173',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);
app.use('/role', roleRoutes);
app.use('/academicYear', academicYearRoutes);
app.use('/studentProfile', studentProfileRoutes);
app.use('/employeeProfile', employeeProfileRoutes);
app.use('/dengueMonitoring', dengueMonitoringRoutes);
app.use('/studentMedical', studentMedicalRoutes);
app.use('/medicineInventory', medicineInventoryRoutes);
app.use('/clinicVisit', clinicVisitRoutes);
// app.use('/log', logRoutes);
app.use('/employeeMedical', employeeMedicalRoutes);
app.use('/feedingProgram', feedingProgramRoutes);
app.use('/deworming', dewormingRoutes);
app.use('/passwordReset', resetPasswordRoutes);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL); // Ensure this is async

    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `Server started on port http://localhost:${process.env.PORT || 8080}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
