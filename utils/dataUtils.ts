import axios from 'axios'
import * as XLSX from 'xlsx'
import hubsData from './hubs.json'

export function fetchHubs() {
  console.debug('Fetching hubs from local JSON...')
  return hubsData.data.page_data.map((hub: any) => ({
    id: hub.id,
    name: hub.name,
  }))
}

export async function fetchCSVData(accessToken: string, hubId: string) {
  console.debug('Fetching CSV data...')
  const response = await axios.post(
    'https://projectxuaeapi.shipsy.io/api/CRMDashboard/riderReconciliation/depositReportCSV',
    {
      descendingOrder: true,
      nextOrPrev: 'first',
      pageNo: 1,
      paginationParams: [],
      resultsPerPage: '50',
      hub_id: hubId,
      bank_deposit_date: [],
      transaction_date: [],
      type: 'transactions'
    },
    {
      headers: {
        'user-id': '2102825743602945225',
        'access-token': accessToken,
        'organisation-id': 'chronodiali',
      },
    }
  )
  console.debug('CSV data fetched successfully.')
  return response.data
}

export async function convertToExcel(csvData: string) {
  console.debug('Converting CSV to Excel...')
  
  // Parse CSV data
  const workbook = XLSX.read(csvData, { type: 'string' })
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Convert to Excel buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  console.debug('Conversion to Excel completed.')
  return excelBuffer
}
