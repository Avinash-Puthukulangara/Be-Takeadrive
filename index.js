import express from 'express';
import { connectDb } from './config/db.js';
import { apiRouter } from './routes/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = new express();
const PORT = 3003;

connectDb();

app.use(cors({
    origin:["http://localhost:5173","https://uiclient-takeadrive-pouszxtuk-avinash-ps-projects.vercel.app"],
    credentials:true,
    methods:['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Hello World!');
})


app.use('/api', apiRouter);





app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`);
})