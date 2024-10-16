import express from 'express';
import { connectDb } from '../config/db.js';
import { apiRouter } from '../routes/index.js';
import cookieParser from 'cookie-parser';
const app = new express();
const PORT = 3003;

connectDb();


app.use(cookieParser());
app.use(express.json());



app.use('/api', apiRouter);





app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`);
})