import express from 'express';
import { connectDb } from '../config/db.js';
const app = new express();
const PORT = 3003;

connectDb();
app.get('/',(req, res)=>{
    res.send('Welcome');
})

app.listen(PORT,()=>{
    console.log(`Serever running on port:${PORT}`);
})