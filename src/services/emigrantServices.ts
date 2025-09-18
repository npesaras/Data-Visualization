import { databases, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

// Type definitions
export interface EmigrantData {
  year: number;
  single: number;
  married: number;
  widower: number;
  separated: number;
  divorced: number;
  notReported: number;
}

export interface Emigrant extends EmigrantData, Models.Document {}

// CREATE
export const addEmigrant = async (data: EmigrantData): Promise<Emigrant> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      data
    );
    return response as unknown as Emigrant;
  } catch (error) {
    console.error('Error adding emigrant:', error);
    throw new Error(`Failed to add emigrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// READ ALL
export const getEmigrants = async (): Promise<Emigrant[]> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc('year'),
        Query.limit(100)
      ]
    );
    return response.documents as unknown as Emigrant[];
  } catch (error) {
    console.error('Error fetching emigrants:', error);
    throw new Error(`Failed to fetch emigrants: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// READ ONE
export const getEmigrant = async (id: string): Promise<Emigrant> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
    return response as unknown as Emigrant;
  } catch (error) {
    console.error('Error fetching emigrant:', error);
    throw new Error(`Failed to fetch emigrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// READ WITH FILTERS
export const getEmigrantsByYear = async (year: number): Promise<Emigrant[]> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('year', year)
      ]
    );
    return response.documents as unknown as Emigrant[];
  } catch (error) {
    console.error('Error fetching emigrants by year:', error);
    throw new Error(`Failed to fetch emigrants by year: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// UPDATE
export const updateEmigrant = async (id: string, data: Partial<EmigrantData>): Promise<Emigrant> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      data
    );
    return response as unknown as Emigrant;
  } catch (error) {
    console.error('Error updating emigrant:', error);
    throw new Error(`Failed to update emigrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// DELETE
export const deleteEmigrant = async (id: string): Promise<void> => {
  try {
    if (!DATABASE_ID || !COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is not configured');
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
  } catch (error) {
    console.error('Error deleting emigrant:', error);
    throw new Error(`Failed to delete emigrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// BATCH OPERATIONS
export const addMultipleEmigrants = async (emigrants: EmigrantData[]): Promise<Emigrant[]> => {
  try {
    const promises = emigrants.map(data => addEmigrant(data));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error adding multiple emigrants:', error);
    throw error;
  }
};

// STATISTICS
export const getEmigrantsStatistics = async () => {
  try {
    const emigrants = await getEmigrants();
    
    const totalByCategory = emigrants.reduce((acc, emigrant) => {
      acc.single += emigrant.single || 0;
      acc.married += emigrant.married || 0;
      acc.widower += emigrant.widower || 0;
      acc.separated += emigrant.separated || 0;
      acc.divorced += emigrant.divorced || 0;
      acc.notReported += emigrant.notReported || 0;
      return acc;
    }, { single: 0, married: 0, widower: 0, separated: 0, divorced: 0, notReported: 0 });

    const totalEmigrants = Object.values(totalByCategory).reduce((sum, count) => sum + count, 0);

    return {
      totalEmigrants,
      totalByCategory,
      yearRange: {
        min: Math.min(...emigrants.map(e => e.year)),
        max: Math.max(...emigrants.map(e => e.year))
      },
      recordCount: emigrants.length
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
};