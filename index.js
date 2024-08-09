// import express from "express";
// import cors from 'cors';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from "url";

// // import AppRoutes from './src/routes/index.js';

// const PORT = 8000

// const app = express()
// app.use(cors());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.get('/location', (req,res) => {
//     const filePath = path.join(__dirname, 'data.json');

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if(err){
//             console.log("Error is : ", err);
//             return res.status(500).json({ error : "Internal Server Error"})
//         }  

//     const locations = JSON.parse(data);
//     const currentTime = new Date().getTime();
    
//     // Find the location closest to the current time

//     let closestLocation = null;
//     let minTimeDifference = Infinity;

//     locations.forEach(location => {
//         const locationTime =  new Date(location.timestamp).getTime();
//         const timeDifference = currentTime - locationTime;

//         if(timeDifference >= 0 && timeDifference < minTimeDifference){
//             minTimeDifference = timeDifference;
//             closestLocation = location;
//         }
//     })

//     if(closestLocation) {
//         res.json(closestLocation);
//     }
//     else{
//         res.json({message: "No more Data"})
//     }

//     // const currentLocation = locations.find(location => {
//     //     const locationTime = new Date(location.timestamp).getTime();
//     //     return locationTime >= currentTime
//     // })

//     // if(currentLocation){
//     //     res.json(currentLocation);
//     // }
//     // else{
//     //     res.json({ message: "No more Data"});
//     // }
//         // try {
//         //    const locations = JSON.parse(data);
//         //    res.json(locations);
//         // } catch (error) {
//         //     console.error("Error is : ", error);
//         //     res.status(500).json({ error : "Internal Server Error"})
//         // }
        
//     });
// })

// app.use(express.json())
// // app.use('/', AppRoutes)

// app.listen(PORT, ()=> console.log(`App is listening to the port ${PORT}`))


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import locationRoutes from './src/routes/locationRoutes.js';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws'; 
import Location from './src/models/locationModel.js';

dotenv.config()
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', locationRoutes);

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  console.log("Client Connected");

  // ws.on('message', (message) => {
  //   console.log('Received:', message);
  // })

  const sendLocationUpdate = async () => {
    const currentTime = new Date().getTime();
    try {

    const closestLocation = await Location.findOne({
        timestamp: { $lte: currentTime }
    }).sort({ timestamp: -1}).select('latitude longitude timestamp -_id');

    if(closestLocation){
        ws.send(JSON.stringify(closestLocation));
    }
} catch (error) {
   console.log("Error is:", error)   
}
}
const intervalId =  setInterval(sendLocationUpdate, 3000);

ws.on('close', () => {
  console.log("client Disconnected");
  clearInterval(intervalId);
});
})
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

// Connect to MongoDB
mongoose.connect(`${process.env.dbUrl}/${process.env.dbName}`, 
//     {
//     useNewUrlParser : true,
//     useUnifiedTopology: true,
// }
).then(()=> {
    console.log("Database connected Successfully");
    
    app.listen(PORT, () => console.log(`Server is running on the port ${PORT}`));
}).catch(err => console.log(err));