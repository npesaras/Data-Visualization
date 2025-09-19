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

// Test connection function - Updated to test database connectivity
export const testConnection = async () => {
    try {
        // Test database connectivity by trying to access a specific database or collection
        if (DATABASE_ID && COLLECTION_ID) {
            // Try to list documents in the collection (this will test full connectivity)
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
            return {
                status: 'success',
                message: 'Database connection successful',
                data: response
            };
        } else {
            // If no database/collection IDs are configured, return a configuration error
            return {
                status: 'error',
                message: 'Database configuration missing',
                error: 'DATABASE_ID or COLLECTION_ID not configured'
            };
        }
    } catch (error) {
        console.error('Connection test error:', error);
        return {
            status: 'error',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Alternative connection test for basic service availability
export const testBasicConnection = async () => {
    try {
        // Try to create a client instance and check if endpoints are reachable
        const testClient = new Client()
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
        
        const testDatabases = new Databases(testClient);
        
        if (DATABASE_ID && COLLECTION_ID) {
            // Test with a simple query
            await testDatabases.listDocuments(DATABASE_ID, COLLECTION_ID, []);
            return {
                status: 'success',
                message: 'Service accessible',
                data: null
            };
        } else {
            return {
                status: 'warning',
                message: 'Service reachable but not configured',
                error: 'Missing environment variables'
            };
        }
    } catch (error) {
        console.error('Basic connection test error:', error);
        return {
            status: 'error',
            message: 'Service unreachable',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const appwriteConfig = {
    client,
    account,
    databases,
    testConnection,
    testBasicConnection
};

export default appwriteConfig;