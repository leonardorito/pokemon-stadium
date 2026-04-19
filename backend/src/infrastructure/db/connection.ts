import mongoose, { type Connection } from 'mongoose';

export async function connectDb(uri: string | undefined): Promise<Connection> {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(uri);
  console.log('Mongo connected');
  return mongoose.connection;
}
