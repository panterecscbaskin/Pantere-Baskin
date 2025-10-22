import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

function toHHMM(dateObj: Date) {
  const hh = String(dateObj.getHours()).padStart(2, '0')
  const mm = String(dateObj.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

async function main() {
  const file = 'CALENDARIO PANTERE x app.xlsx'
  const wb = XLSX.readFile(file)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

  for (const row of rows) {
    const dataRaw = row['DATA'] || row['data']
    const oraRaw = row['ORA'] || row['ora']
    const venue = String(row['DOVE'] || row['dove'] || '').trim()
    const home = String(row['SQUADRA A'] || row['SQUADRA A '] || row['squadra a'] || '').trim()
    const away = String(row['SQUADRA B'] || row['squadra b'] || '').trim()

    if (!dataRaw || !home || !away) continue

    let date: Date
    try {
      date = new Date(dataRaw)
    } catch {
      continue
    }

    let time = ''
    if (oraRaw) {
      try {
        const parsed = new Date(`1970-01-01T${String(oraRaw).slice(0,5)}:00`)
        time = toHHMM(parsed)
      } catch {
        time = String(oraRaw).slice(0,5)
      }
    }

    await prisma.game.create({
      data: {
        date,
        time: time || '00:00',
        venue: venue || '',
        teamHome: home,
        teamAway: away,
        meetAtField: true,
        meetPoint: null,
        meetTime: null
      }
    })
  }

  console.log('Import calendario completato')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
