import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const account = new Account(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Test connection function
export const testConnection = async () => {
    try {
        const response = await account.get();
        return {
            status: 'success',
            message: 'Connection successful',
            data: response
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const appwriteConfig = {
    client,
    account,
    databases,
    testConnection
};

export default appwriteConfig;