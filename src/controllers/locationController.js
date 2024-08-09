import Location from "../models/locationModel.js";

// Fetch the Current Location
const getCurrentLocation = async (req,res) => {
    // const currentTime = new Date().getTime();
    const currentTime = new Date().toISOString();

    try {
        const closestLocation = await Location.findOne({
            timestamp: { $lte: currentTime}
        })
        .sort({ timestamp: -1}) //get the closest past location
        .select('latitude longitude timestamp -_id'); //Only select the needed fields

        if(closestLocation){
            res.json(closestLocation);
        }
        else{
            res.json({ message: "No more Data" })
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });  
    } 
};


// Add a new Location
const addLocation = async (req,res) => {
    const { latitude, longitude } = req.body;

    try {
       const newLocation = new Location({ latitude, longitude });
       await newLocation.save();

       res.status(201).json(
        {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            timestamp: newLocation.timestamp
        }
       );

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default { 
   getCurrentLocation,
   addLocation
}