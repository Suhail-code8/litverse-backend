const mongoose = require('mongoose')

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri,{
            dbName : "litverse"
        })
        console.log('Database connection established');
        
    } catch (err) {
        console.error(`data base connection error : `,err)
        throw err;
    }
}

module.exports = connectDB;