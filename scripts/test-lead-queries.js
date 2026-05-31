import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { countLeads, getLeads } from '../api/lib/db/leadQueries.ts'

const count = await countLeads()
console.log('count', count)
const leads = await getLeads()
console.log('leads', leads.length, leads[0]?.companyName)
