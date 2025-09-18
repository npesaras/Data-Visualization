import { Client, Account, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); 

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

// Test connection function
export const testConnection = async () => {
    try {
        // Attempt to get account details - this will fail if connection is invalid
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
            error: error.message
        };
    }
};

// Config object
export const appwriteConfig = {
    client,
    account,
    databases,
    testConnection
};


export default appwriteConfig;