import mongoose, { Schema, type Model, type Document } from 'mongoose';
import type { User as UserType, Project as ProjectType, Pixel as PixelType } from './types';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Mongoose Schemas
const UserSchema = new Schema<UserType>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: true },
  streak: { type: Number, default: 0 },
  totalContributions: { type: Number, default: 0 },
});

// Use a virtual `id` field to match what Firestore was providing
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
UserSchema.set('toJSON', {
  virtuals: true,
});

const ProjectSchema = new Schema<ProjectType>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String, required: true },
  creatorAvatar: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
  completionPercentage: { type: Number, default: 0 },
  contributorCount: { type: Number, default: 0 },
  theme: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

ProjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ProjectSchema.set('toJSON', {
  virtuals: true,
});

const PixelSchema = new Schema<PixelType>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: { type: String, required: true },
}, {
    timestamps: true,
});
// Create a compound index for efficient upserts
PixelSchema.index({ projectId: 1, x: 1, y: 1 }, { unique: true });

// Mongoose Models
// To prevent model overwrite errors in HMR, check if the model already exists.
export const User: Model<UserType> = mongoose.models.User || mongoose.model<UserType>('User', UserSchema);
export const Project: Model<ProjectType> = mongoose.models.Project || mongoose.model<ProjectType>('Project', ProjectSchema);
export const Pixel: Model<PixelType> = mongoose.models.Pixel || mongoose.model<PixelType>('Pixel', PixelSchema);

export default dbConnect;
