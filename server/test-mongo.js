import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not set in environment');
  process.exit(1);
}

console.log('Attempting MongoDB connection to:', uri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@)/, '$1***$2'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
    process.exit(2);
  });
