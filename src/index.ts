// src/index.ts
const fs = require('fs');
const csvParser = require('csv-parser');

// Function to validate the header of the CSV file
function validateHeader(header: string[]): boolean {
  const requiredColumns = [
    'content_post_id',
    'content_post_slug',
    'content_body',
    'content_post_status',
    'content_post_title',
    'directory_category',
    'content_children_count',
    'directory_contact__email',
    'directory_contact__fax',
    'directory_contact__mobile',
    'directory_contact__phone',
    'directory_contact__website',
    'directory_location__street',
    'directory_location__city',
    'directory_location__country',
    'directory_location__address',
    'directory_location__lat',
    'directory_location__lng',
    'directory_location__zip',
    'directory_location__state',
    'directory_social__facebook',
    'directory_social__googleplus',
    'directory_social__twitter',
    // Add other required columns as needed
  ];
  for (const column of requiredColumns) {
    if (!header.includes(column)) {
      console.error(`Error: Missing required column - ${column}`);
      return false;
    }
  }

  return true;
}
// Function to parse and process spreadsheet data
function processSpreadsheet(filePath: string): void {
  const jsonData: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csvParser()).on('headers', (headers: string[]) => {
      // Validate the header before processing data
      if (!validateHeader(headers)) {
        process.exit(1); // Terminate the process if validation fails
      }
    })
    .on('data', (row: Record<string, string>) => { // Add type for 'row'
      // Implement your processing logic here

      const childCountArray = row.content_children_count
        .split(';')
        .map((item) => {
          const [key, value] = item.split('|');
          return { [key]: parseInt(value, 10) || 0 };
        });

      const indexEntry = {
        // Define your schema based on the spreadsheet columns
        id: row.content_post_id,
        slug: row.content_post_slug,
        body: row.content_body,
        status: row.content_post_status,
        title: row.content_post_title,
        category: row.directory_category,
        child_count: childCountArray,
        contact: {
          email: row.directory_contact__email,
          fax: row.directory_contact__fax,
          mobile: row.directory_contact__mobile,
          phone: row.directory_contact__phone,
          website: row.directory_contact__website
        },
        location : {
          street_name: row.directory_location__street,
          city: row.directory_location__city,
          country: row.directory_location__country,
          address: row.directory_location__address,
          lat:row.directory_location__lat,
          lng: row.directory_location__lng,
          zip: row.directory_location__zip,
          state: row.directory_location__state
        },
        social:{
          facebook: row.directory_social__facebook,
          google: row.directory_social__googleplus,
          twitter: row.directory_social__twitter,

        }
        // Add other properties as needed
      };
      

      jsonData.push(indexEntry);
    })
    .on('end', () => {
      // Output JSON data to the console
      jsonData.forEach((entry) => console.log(JSON.stringify(entry) + '\n'));
    });
}

// Provide the path to your spreadsheet in the root folder
const spreadsheetPath = 'test_data.csv';

// Execute the processing function
processSpreadsheet(spreadsheetPath);
