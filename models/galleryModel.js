import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({

    title: {
        type: String,
    },
    filePath: {
        type: String,
    },
    fileType: {
        type: String,
    },
    fileSize: {
        type: String,
    },
    dimensions: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Set the default value to the current date and time
    },
});


const galleryModel = mongoose.model('Gallery', gallerySchema);

export default galleryModel;