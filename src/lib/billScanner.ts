import type { ExtractedBillData } from './types'

// Ported from PersonalFinance BillScanner.kt (OCR extraction logic)
export function extractBillData(text: string): ExtractedBillData {
  const lines = text.split('\n').map((l) => l.trim())

  return {
    totalAmount: extractAmount(lines),
    date: extractDate(lines),
    merchantName: extractMerchantName(lines),
    items: extractItems(lines),
    rawText: text,
  }
}

function extractAmount(lines: string[]): number | null {
  const patterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /\$\s*(\d+\.?\d*)/,
    /(\d+\.\d{2})/,
  ]

  for (const line of [...lines].reverse()) {
    for (const pattern of patterns) {
      const match = pattern.exec(line)
      if (match) {
        return Number(match[1])
      }
    }
  }
  return null
}

function extractDate(lines: string[]): string | null {
  const patterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,
    /\d{1,2}-\d{1,2}-\d{2,4}/,
    /\d{4}-\d{1,2}-\d{1,2}/,
  ]

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = pattern.exec(line)
      if (match) return match[0]
    }
  }
  return null
}

function extractMerchantName(lines: string[]): string | null {
  return lines.find((l) => l.length > 3) ?? null
}

function extractItems(lines: string[]): string[] {
  return lines
    .filter((l) => /\d+\.?\d*/.test(l) && l.length > 5 && !/total/i.test(l))
    .slice(0, 10)
}
