import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
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

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // replace with a real secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // enable in production
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

const corsOptions = {
  origin: 'http://127.0.0.1:5173', // Replace with your frontend's URL
  credentials: true, // This is important for cookies
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
