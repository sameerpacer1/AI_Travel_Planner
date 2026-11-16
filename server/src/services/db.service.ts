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

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  destination: string | null;
  travel_dates: string | null;
  travelers_count: number | null;
  budget: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback stores (used only if PostgreSQL is unreachable during offline local development)
const fallbackUsers = new Map<string, UserRecord>();
const fallbackTrips = new Map<string, TripRecord>();
const fallbackInquiries = new Map<string, InquiryRecord>();

let useFallbackStore = false;

// Check at startup whether Prisma is connected with retry logic (allows Supabase pooler time to wake up)
export async function determineDbMode(retries = 3, delayMs = 1500): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      useFallbackStore = false;
      console.log('✅ Supabase PostgreSQL Database connected and active for all operations.');
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (attempt < retries) {
        console.warn(`⏳ Waiting for database connection (attempt ${attempt}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        useFallbackStore = true;
        console.warn('⚠️  PostgreSQL connection failed. Using local in-memory fallback store:', errMsg);
      }
    }
  }
  return false;
}

// Ensure database connection is active (attempts to reconnect if previously failed)
async function ensureDbConnection(): Promise<boolean> {
  if (!useFallbackStore) return true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    useFallbackStore = false;
    console.log('🔄 Successfully reconnected to Supabase PostgreSQL Database!');
    return true;
  } catch {
    return false;
  }
}

// Run initial check asynchronously
determineDbMode();

export class DbService {
  // USER METHODS
  static async findUserByEmail(email: string): Promise<UserRecord | null> {
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        return user as UserRecord | null;
      } catch (err) {
        console.error('❌ Prisma findUserByEmail error:', err instanceof Error ? err.message : err);
      }
    }

    const normalized = email.toLowerCase();
    for (const user of fallbackUsers.values()) {
      if (user.email === normalized) return user;
    }
    return null;
  }

  static async findUserById(id: string): Promise<UserRecord | null> {
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user as UserRecord | null;
      } catch (err) {
        console.error('❌ Prisma findUserById error:', err instanceof Error ? err.message : err);
      }
    }

    return fallbackUsers.get(id) ?? null;
  }

  static async createUser(data: { name: string; email: string; passwordHash: string }): Promise<UserRecord> {
    await ensureDbConnection();
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
      } catch (err: unknown) {
        console.error('❌ Prisma createUser error:', err instanceof Error ? err.message : err);
        // If unique constraint violation, propagate so caller returns 409 Conflict
        const prismaErr = err as { code?: string };
        if (prismaErr?.code === 'P2002') {
          throw err;
        }
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
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data,
        });
        return updated as UserRecord;
      } catch (err) {
        console.error('❌ Prisma updateUser error:', err instanceof Error ? err.message : err);
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

    await ensureDbConnection();
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
        console.error('❌ Prisma createTrip error:', err instanceof Error ? err.message : err);
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
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const trips = await prisma.trip.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return trips as unknown as TripRecord[];
      } catch (err) {
        console.error('❌ Prisma findTripsByUserId error:', err instanceof Error ? err.message : err);
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
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const trip = await prisma.trip.findFirst({
          where: { id, userId },
        });
        return trip as unknown as TripRecord | null;
      } catch (err) {
        console.error('❌ Prisma findTripByIdAndUserId error:', err instanceof Error ? err.message : err);
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

    await ensureDbConnection();
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
        console.error('❌ Prisma updateTrip error:', err instanceof Error ? err.message : err);
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

    await ensureDbConnection();
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
        console.error('❌ Prisma updateTripItinerary error:', err instanceof Error ? err.message : err);
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

    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        await prisma.trip.delete({ where: { id } });
        return true;
      } catch (err) {
        console.error('❌ Prisma deleteTrip error:', err instanceof Error ? err.message : err);
      }
    }

    return fallbackTrips.delete(id);
  }

  // INQUIRY METHODS
  static async createInquiry(data: {
    name: string;
    email: string;
    phone?: string | null;
    destination?: string | null;
    travel_dates?: string | null;
    travelers_count?: number | null;
    budget?: string | null;
    message?: string | null;
  }): Promise<InquiryRecord> {
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const item = await prisma.inquiry.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            phone: data.phone || null,
            destination: data.destination || null,
            travel_dates: data.travel_dates || null,
            travelers_count: data.travelers_count || 1,
            budget: data.budget || null,
            message: data.message || null,
            status: 'pending',
          },
        });
        return item as InquiryRecord;
      } catch (err) {
        console.error('❌ Prisma createInquiry error:', err instanceof Error ? err.message : err);
      }
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const item: InquiryRecord = {
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      destination: data.destination || null,
      travel_dates: data.travel_dates || null,
      travelers_count: data.travelers_count || 1,
      budget: data.budget || null,
      message: data.message || null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    fallbackInquiries.set(id, item);
    return item;
  }

  static async listInquiries(): Promise<InquiryRecord[]> {
    await ensureDbConnection();
    if (!useFallbackStore) {
      try {
        const items = await prisma.inquiry.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return items as InquiryRecord[];
      } catch (err) {
        console.error('❌ Prisma listInquiries error:', err instanceof Error ? err.message : err);
      }
    }

    return Array.from(fallbackInquiries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  static isUsingFallback(): boolean {
    return useFallbackStore;
  }
}
