import { addEmigrant, type Emigrant } from './emigrantServices';

// CSV column mapping interface
export interface CSVRow {
  year: string;
  single: string;
  married: string;
  widower: string;
  separated: string;
  divorced: string;
  notReported: string;
}

// Expected CSV headers (case-insensitive)
const EXPECTED_HEADERS = [
  'year',
  'single', 
  'married',
  'widower',
  'separated',
  'divorced',
  'notreported'
];

// Alternative header names that should be mapped
const HEADER_MAPPINGS: Record<string, string> = {
  'not reported': 'notreported',
  'not_reported': 'notreported',
  'notreported': 'notreported',
  'single': 'single',
  'married': 'married',
  'widower': 'widower',
  'separated': 'separated',
  'divorced': 'divorced',
  'year': 'year'
};

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  data?: Emigrant[];
}

/**
 * Parse CSV content and validate structure
 */
export function parseCSV(csvContent: string): { headers: string[], rows: string[][] } {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  
  // Parse data rows
  const rows = lines.slice(1).map(line => {
    // Handle CSV with quoted values
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    return values;
  });

  return { headers, rows };
}

/**
 * Validate CSV headers match expected structure
 */
export function validateHeaders(headers: string[]): { isValid: boolean, mappedHeaders: string[], errors: string[] } {
  const errors: string[] = [];
  const mappedHeaders: string[] = [];

  // Map headers to expected format
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    const mappedHeader = HEADER_MAPPINGS[normalizedHeader];
    
    if (mappedHeader) {
      mappedHeaders.push(mappedHeader);
    } else {
      mappedHeaders.push(normalizedHeader);
      errors.push(`Unknown header: "${header}"`);
    }
  }

  // Check if all required headers are present
  const missingHeaders = EXPECTED_HEADERS.filter(expected => 
    !mappedHeaders.includes(expected)
  );

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const isValid = errors.length === 0;
  return { isValid, mappedHeaders, errors };
}

/**
 * Convert CSV row to Emigrant data
 */
export function convertRowToEmigrant(row: string[], mappedHeaders: string[]): Partial<Emigrant> | null {
  try {
    const data: Record<string, number> = {};
    
    // Map row values to headers
    mappedHeaders.forEach((header, index) => {
      const value = row[index]?.trim() || '0';
      
      if (header === 'year') {
        data[header] = parseInt(value) || 0;
      } else {
        data[header] = parseInt(value) || 0;
      }
    });

    // Validate year is reasonable
    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 10) {
      throw new Error(`Invalid year: ${data.year}`);
    }

    // Ensure all required fields exist and return proper type
    const emigrantData = {
      year: data.year,
      single: data.single || 0,
      married: data.married || 0,
      widower: data.widower || 0,
      separated: data.separated || 0,
      divorced: data.divorced || 0,
      notReported: data.notreported || 0
    };

    return emigrantData;
  } catch (error) {
    console.error('Error converting row to emigrant:', error);
    return null;
  }
}

/**
 * Import CSV file and save to Appwrite
 */
export async function importCSVToAppwrite(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    skippedCount: 0,
    errors: [],
    data: []
  };

  try {
    // Read file content
    const csvContent = await file.text();
    
    if (!csvContent.trim()) {
      throw new Error('CSV file is empty');
    }

    // Parse CSV
    const { headers, rows } = parseCSV(csvContent);
    
    // Validate headers
    const { isValid, mappedHeaders, errors: headerErrors } = validateHeaders(headers);
    
    if (!isValid) {
      result.errors = headerErrors;
      result.message = `Invalid CSV structure: ${headerErrors.join(', ')}`;
      return result;
    }

    console.log(`Processing ${rows.length} rows from CSV...`);

    // Process each row
    const importedData: Emigrant[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because arrays are 0-indexed and we skip header
      
      try {
        // Skip empty rows
        if (row.every(cell => !cell.trim())) {
          result.skippedCount++;
          continue;
        }

        // Convert row to emigrant data
        const emigrantData = convertRowToEmigrant(row, mappedHeaders);
        
        if (!emigrantData) {
          errors.push(`Row ${rowNumber}: Failed to parse data`);
          result.skippedCount++;
          continue;
        }

        // Ensure all required fields are present for Appwrite
        const completeEmigrantData = {
          year: emigrantData.year!,
          single: emigrantData.single!,
          married: emigrantData.married!,
          widower: emigrantData.widower!,
          separated: emigrantData.separated!,
          divorced: emigrantData.divorced!,
          notReported: emigrantData.notReported!
        };

        // Save to Appwrite
        console.log(`Importing row ${rowNumber}:`, completeEmigrantData);
        const savedEmigrant = await addEmigrant(completeEmigrantData);
        
        importedData.push(savedEmigrant);
        result.importedCount++;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Row ${rowNumber}: ${errorMessage}`);
        result.skippedCount++;
        console.error(`Error processing row ${rowNumber}:`, error);
      }
    }

    // Set result
    result.data = importedData;
    result.errors = errors;
    
    if (result.importedCount > 0) {
      result.success = true;
      result.message = `Successfully imported ${result.importedCount} records${result.skippedCount > 0 ? `, skipped ${result.skippedCount} rows` : ''}`;
    } else {
      result.message = 'No records were imported';
    }

    console.log('Import completed:', result);
    return result;

  } catch (error) {
    console.error('CSV import failed:', error);
    result.message = error instanceof Error ? error.message : 'Unknown error occurred during import';
    result.errors.push(result.message);
    return result;
  }
}

/**
 * Validate CSV file before import
 */
export async function validateCSVFile(file: File): Promise<{ isValid: boolean, errors: string[], preview?: CSVRow[] }> {
  try {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { isValid: false, errors: ['File must be a CSV file'] };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, errors: ['File size must be less than 10MB'] };
    }

    // Read and parse first few lines for preview
    const csvContent = await file.text();
    const { headers, rows } = parseCSV(csvContent);
    
    // Validate headers
    const { isValid, errors } = validateHeaders(headers);
    
    if (!isValid) {
      return { isValid: false, errors };
    }

    // Create preview with first 3 rows
    const preview: CSVRow[] = rows.slice(0, 3).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj as unknown as CSVRow;
    });

    return { isValid: true, errors: [], preview };

  } catch (error) {
    return { 
      isValid: false, 
      errors: [error instanceof Error ? error.message : 'Failed to validate CSV file'] 
    };
  }
}

/**
 * Generate sample CSV content for download
 */
export function generateSampleCSV(): string {
  const headers = ['year', 'single', 'married', 'widower', 'separated', 'divorced', 'notReported'];
  const sampleData = [
    ['2020', '15000', '25000', '2000', '1500', '3000', '1000'],
    ['2021', '16500', '27000', '2200', '1600', '3200', '1100'],
    ['2022', '17200', '26800', '2100', '1700', '3300', '1200']
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download sample CSV file
 */
export function downloadSampleCSV(): void {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'emigrant_data_sample.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}
