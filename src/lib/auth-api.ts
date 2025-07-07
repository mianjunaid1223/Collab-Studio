import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect, { User } from '@/lib/mongodb';
import type { User as UserType } from '@/lib/types';

const COOKIE_NAME = 'session';

/**
 * Get the current user from API route request
 * This is for use in API routes only, not server components
 */
export async function getCurrentUserFromRequest(req: NextApiRequest): Promise<UserType | null> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET not defined. Authentication is disabled.');
    return null;
  }

  // Get token from cookies in the request
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const conn = await dbConnect();
    if (!conn) {
      return null;
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    // Token is invalid or expired - this is normal
    return null;
  }
}
