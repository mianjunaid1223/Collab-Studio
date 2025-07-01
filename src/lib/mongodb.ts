import mongoose, { Schema, type Model, type Document } from 'mongoose';
import type { User as UserType, Project as ProjectType, Contribution as ContributionType } from './types';
import { canvasTypes } from './types';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn(
      'MONGODB_URI not defined. App is in a read-only state. Please create a .env.local file with your MongoDB connection string to enable database operations.'
    );
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
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

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
UserSchema.set('toJSON', {
  virtuals: true,
});

const ProjectSchema = new Schema<ProjectType>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  canvasType: { type: String, enum: canvasTypes, required: true },
  width: { type: Number },
  height: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String, required: true },
  creatorAvatar: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
  completionPercentage: { type: Number, default: 0 },
  contributorCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

ProjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ProjectSchema.set('toJSON', {
  virtuals: true,
});

const ContributionSchema = new Schema<ContributionType>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: canvasTypes, required: true },
    data: { type: Schema.Types.Mixed, required: true },
}, {
    timestamps: true,
});
ContributionSchema.index({ projectId: 1 });


// Mongoose Models
export const User: Model<UserType> = mongoose.models.User || mongoose.model<UserType>('User', UserSchema);
export const Project: Model<ProjectType> = mongoose.models.Project || mongoose.model<ProjectType>('Project', ProjectSchema);
export const Contribution: Model<ContributionType> = mongoose.models.Contribution || mongoose.model<ContributionType>('Contribution', ContributionSchema);

export default dbConnect;
