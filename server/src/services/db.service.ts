import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { CreateTripInput, UpdateTripInput } from '../schemas/trip.schema.js';
import { Itinerary } from '../schemas/itinerary.schema.js';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripRecord {
  id: string;
  userId: string;
  title: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  budget: number;
  currency: string;
  travelStyle: string;
  interests: string[];
  transportPreference: string;
  accommodationPreference: string;
  additionalPreferences: string | null;
  itinerary: Itinerary | null;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback stores (used automatically if PostgreSQL is unreachable during local initial setup)
const fallbackUsers = new Map<string, UserRecord>();
const fallbackTrips = new Map<string, TripRecord>();

let useFallbackStore = false;

// Check at startup whether Prisma is connected
async function determineDbMode(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    useFallbackStore = false;
    return true;
  } catch (err) {
    useFallbackStore = true;
    console.warn('⚠️  PostgreSQL/Neon DB connection failed or not configured. Using local in-memory fallback store for uninterrupted testing & development.');
    return false;
  }
}

// Run the check asynchronously
determineDbMode();

export class DbService {
  // USER METHODS
  static async findUserByEmail(email: string): Promise<UserRecord | null> {
    if (!useFallbackStore) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        return user as UserRecord | null;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const normalized = email.toLowerCase();
    for (const user of fallbackUsers.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  static async findUserById(id: string): Promise<UserRecord | null> {
    if (!useFallbackStore) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user as UserRecord | null;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    return fallbackUsers.get(id) ?? null;
  }

  static async createUser(data: { name: string; email: string; passwordHash: string }): Promise<UserRecord> {
    if (!useFallbackStore) {
      try {
        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
          },
        });
        return user as UserRecord;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const now = new Date();
    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      emailVerified: false,
      googleId: null,
      createdAt: now,
      updatedAt: now,
    };
    fallbackUsers.set(newUser.id, newUser);
    return newUser;
  }

  static async updateUser(
    id: string,
    data: { name?: string; passwordHash?: string }
  ): Promise<UserRecord | null> {
    if (!useFallbackStore) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data,
        });
        return updated as UserRecord;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const existing = fallbackUsers.get(id);
    if (!existing) return null;

    const updated: UserRecord = {
      ...existing,
      ...(data.name && { name: data.name }),
      ...(data.passwordHash && { passwordHash: data.passwordHash }),
      updatedAt: new Date(),
    };
    fallbackUsers.set(id, updated);
    return updated;
  }

  // TRIP METHODS (Enforces strict user ownership - IDOR Defense)
  static async createTrip(userId: string, data: CreateTripInput): Promise<TripRecord> {
    const title = data.title || `Trip to ${data.destination}`;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (!useFallbackStore) {
      try {
        const trip = await prisma.trip.create({
          data: {
            userId,
            title,
            origin: data.origin,
            destination: data.destination,
            startDate,
            endDate,
            travelers: data.travelers,
            budget: data.budget,
            currency: data.currency,
            travelStyle: data.travelStyle,
            interests: data.interests,
            transportPreference: data.transportPreference,
            accommodationPreference: data.accommodationPreference,
            additionalPreferences: data.additionalPreferences ?? null,
            itinerary: Prisma.JsonNull,
            isGenerated: false,
          },
        });
        return trip as unknown as TripRecord;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const now = new Date();
    const newTrip: TripRecord = {
      id: crypto.randomUUID(),
      userId,
      title,
      origin: data.origin,
      destination: data.destination,
      startDate,
      endDate,
      travelers: data.travelers,
      budget: data.budget,
      currency: data.currency,
      travelStyle: data.travelStyle,
      interests: data.interests,
      transportPreference: data.transportPreference,
      accommodationPreference: data.accommodationPreference,
      additionalPreferences: data.additionalPreferences ?? null,
      itinerary: null,
      isGenerated: false,
      createdAt: now,
      updatedAt: now,
    };
    fallbackTrips.set(newTrip.id, newTrip);
    return newTrip;
  }

  static async findTripsByUserId(userId: string): Promise<TripRecord[]> {
    if (!useFallbackStore) {
      try {
        const trips = await prisma.trip.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return trips as unknown as TripRecord[];
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const userTrips: TripRecord[] = [];
    for (const trip of fallbackTrips.values()) {
      if (trip.userId === userId) {
        userTrips.push(trip);
      }
    }
    return userTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async findTripByIdAndUserId(id: string, userId: string): Promise<TripRecord | null> {
    if (!useFallbackStore) {
      try {
        const trip = await prisma.trip.findFirst({
          where: { id, userId },
        });
        return trip as unknown as TripRecord | null;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const trip = fallbackTrips.get(id);
    if (!trip || trip.userId !== userId) {
      return null;
    }
    return trip;
  }

  static async updateTrip(
    id: string,
    userId: string,
    data: UpdateTripInput
  ): Promise<TripRecord | null> {
    const existing = await this.findTripByIdAndUserId(id, userId);
    if (!existing) return null;

    if (!useFallbackStore) {
      try {
        const updated = await prisma.trip.update({
          where: { id },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.origin && { origin: data.origin }),
            ...(data.destination && { destination: data.destination }),
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
            ...(data.travelers && { travelers: data.travelers }),
            ...(data.budget && { budget: data.budget }),
            ...(data.currency && { currency: data.currency }),
            ...(data.travelStyle && { travelStyle: data.travelStyle }),
            ...(data.interests && { interests: data.interests }),
            ...(data.transportPreference && { transportPreference: data.transportPreference }),
            ...(data.accommodationPreference && { accommodationPreference: data.accommodationPreference }),
            ...(data.additionalPreferences !== undefined && {
              additionalPreferences: data.additionalPreferences,
            }),
          },
        });
        return updated as unknown as TripRecord;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const current = fallbackTrips.get(id);
    if (!current || current.userId !== userId) return null;

    const updated: TripRecord = {
      ...current,
      ...(data.title && { title: data.title }),
      ...(data.origin && { origin: data.origin }),
      ...(data.destination && { destination: data.destination }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.travelers && { travelers: data.travelers }),
      ...(data.budget && { budget: data.budget }),
      ...(data.currency && { currency: data.currency }),
      ...(data.travelStyle && { travelStyle: data.travelStyle }),
      ...(data.interests && { interests: data.interests }),
      ...(data.transportPreference && { transportPreference: data.transportPreference }),
      ...(data.accommodationPreference && { accommodationPreference: data.accommodationPreference }),
      ...(data.additionalPreferences !== undefined && {
        additionalPreferences: data.additionalPreferences,
      }),
      updatedAt: new Date(),
    };
    fallbackTrips.set(id, updated);
    return updated;
  }

  static async updateTripItinerary(
    id: string,
    userId: string,
    itinerary: Itinerary
  ): Promise<TripRecord | null> {
    const existing = await this.findTripByIdAndUserId(id, userId);
    if (!existing) return null;

    if (!useFallbackStore) {
      try {
        const updated = await prisma.trip.update({
          where: { id },
          data: {
            itinerary: itinerary as unknown as Prisma.InputJsonValue,
            isGenerated: true,
          },
        });
        return updated as unknown as TripRecord;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    const current = fallbackTrips.get(id);
    if (!current || current.userId !== userId) return null;

    const updated: TripRecord = {
      ...current,
      itinerary,
      isGenerated: true,
      updatedAt: new Date(),
    };
    fallbackTrips.set(id, updated);
    return updated;
  }

  static async deleteTrip(id: string, userId: string): Promise<boolean> {
    const existing = await this.findTripByIdAndUserId(id, userId);
    if (!existing) return false;

    if (!useFallbackStore) {
      try {
        await prisma.trip.delete({ where: { id } });
        return true;
      } catch (err) {
        useFallbackStore = true;
      }
    }

    return fallbackTrips.delete(id);
  }

  static isUsingFallback(): boolean {
    return useFallbackStore;
  }
}
