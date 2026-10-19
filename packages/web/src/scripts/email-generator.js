// Random test email addresses. Defaults to example.com, a domain reserved for documentation and testing.

export const MAX_COUNT = 50000;

const FIRST_NAMES = ['ava','liam','noah','emma','olivia','mia','ethan','lucas','amelia','sofia','aarav','isha','kabir','ananya','rohan','priya','arjun','meera','leo','zara','yuki','hiro','mei','chen','omar','layla','diego','lucia','pedro','elena','ivan','anya','sam','alex','jordan','taylor','riley','casey','morgan'];
const LAST_NAMES = ['smith','patel','garcia','kim','nguyen','khan','silva','rossi','mueller','tanaka','singh','lopez','brown','wilson','martin','rao','das','ali','novak','moreau','costa','park','chen','hughes','walker','young','king','reed','cole','ford'];

const pick = list => list[Math.floor(Math.random() * list.length)];

export function generateEmails({ count, domain = 'example.com', withDigits = true }) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > MAX_COUNT) {
    throw new Error(`Enter a whole number from 1 to ${MAX_COUNT.toLocaleString()}.`);
  }
  const cleanDomain = String(domain).trim().toLowerCase();
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleanDomain)) {
    throw new Error('Enter a domain such as example.com.');
  }

  const emails = new Set();
  while (emails.size < n) {
    const local = `${pick(FIRST_NAMES)}.${pick(LAST_NAMES)}`;
    const suffix = withDigits ? String(Math.floor(Math.random() * 10000)) : '';
    emails.add(`${local}${suffix}@${cleanDomain}`);
  }
  return [...emails];
}

export function toCsv(emails) {
  return ['email', ...emails].join('\r\n') + '\r\n';
}

// Excel opens an XML Spreadsheet 2003 file saved with an .xls name
export function toSpreadsheetXml(emails) {
  const escape = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
  const rows = ['email', ...emails]
    .map(v => `<Row><Cell><Data ss:Type="String">${escape(v)}</Data></Cell></Row>`)
    .join('');
  return `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n` +
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
    `<Worksheet ss:Name="Emails"><Table>${rows}</Table></Worksheet></Workbook>\n`;
}
