import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

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

export interface Emigrant extends EmigrantData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// CREATE
export const addEmigrant = async (data: EmigrantData): Promise<Emigrant> => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      data
    );
    return response as Emigrant;
  } catch (error) {
    console.error('Error adding emigrant:', error);
    throw error;
  }
};

// READ ALL
export const getEmigrants = async (): Promise<Emigrant[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc('year'), // Order by year descending
        Query.limit(100) // Limit results
      ]
    );
    return response.documents as Emigrant[];
  } catch (error) {
    console.error('Error fetching emigrants:', error);
    throw error;
  }
};

// READ ONE
export const getEmigrant = async (id: string): Promise<Emigrant> => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
    return response as Emigrant;
  } catch (error) {
    console.error('Error fetching emigrant:', error);
    throw error;
  }
};

// READ WITH FILTERS
export const getEmigrantsByYear = async (year: number): Promise<Emigrant[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('year', year)
      ]
    );
    return response.documents as Emigrant[];
  } catch (error) {
    console.error('Error fetching emigrants by year:', error);
    throw error;
  }
};

// UPDATE
export const updateEmigrant = async (id: string, data: Partial<EmigrantData>): Promise<Emigrant> => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      data
    );
    return response as Emigrant;
  } catch (error) {
    console.error('Error updating emigrant:', error);
    throw error;
  }
};

// DELETE
export const deleteEmigrant = async (id: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
  } catch (error) {
    console.error('Error deleting emigrant:', error);
    throw error;
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