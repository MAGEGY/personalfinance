import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { extractBillData } from '../lib/billScanner'
import { addTransaction, getTransactions } from '../lib/storage'
import { CATEGORIES } from '../lib/types'
import type { ExtractedBillData } from '../lib/types'

type Status = 'idle' | 'camera' | 'ocr' | 'done' | 'error'

export default function ScannerScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [bill, setBill] = useState<ExtractedBillData | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(1)
  const [error, setError] = useState('')

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('camera')
    } catch {
      setError('Camera not available. Use "Upload image" instead.')
      setStatus('error')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function runOcr(canvas: HTMLCanvasElement) {
    setStatus('ocr')
    stopCamera()
    try {
      const result = await window.Tesseract.recognize(canvas, 'eng')
      const data = extractBillData(result.data.text)
      setBill(data)
      if (data.totalAmount) setAmount(String(data.totalAmount))
      if (data.date) setDate(normalizeDate(data.date))
      if (data.merchantName) setDescription(data.merchantName)
      setStatus('done')
    } catch {
      setError('OCR failed. Please try again.')
      setStatus('error')
    }
  }

  function normalizeDate(d: string): string {
    const m = d.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/)
    if (m) {
      const year = m[3].length === 2 ? `20${m[3]}` : m[3]
      return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    }
    return d
  }

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    runOcr(canvas)
  }

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      runOcr(canvas)
    }
    img.src = URL.createObjectURL(file)
  }

  function saveTransaction() {
    const value = Number(amount)
    if (!value || value <= 0) return
    addTransaction({
      amount: value,
      type: 'EXPENSE',
      categoryId,
      description: description || bill?.merchantName || 'Scanned bill',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    })
    reset()
  }

  function reset() {
    setBill(null)
    setAmount('')
    setDate('')
    setDescription('')
    setError('')
    setStatus('idle')
  }

  return (
    <section className="scan">
      {(status === 'idle' || status === 'error') && (
        <div className="actions">
          <button className="primary" onClick={startCamera}>📷 Start camera</button>
          <label className="primary upload">
            🖼 Upload bill photo
            <input type="file" accept="image/*" onChange={onUpload} hidden />
          </label>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {status === 'camera' && (
        <div className="camera">
          <video ref={videoRef} autoPlay playsInline />
          <div className="actions">
            <button className="primary" onClick={capture}>📸 Capture & scan</button>
            <button onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {status === 'ocr' && <p className="loading">⏳ Running OCR… first scan downloads the language model.</p>}

      {status === 'done' && bill && (
        <div className="results">
          <h2>Extracted bill data</h2>
          <div className="add-form">
            <input type="number" placeholder="Total amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input placeholder="Merchant / description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
              {CATEGORIES.filter((c) => c.type === 'EXPENSE').map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <button className="primary" onClick={saveTransaction}>Save as expense</button>
            <button onClick={reset}>Discard</button>
          </div>

          {bill.items.length > 0 && (
            <details>
              <summary>Detected line items ({bill.items.length})</summary>
              <ul>{bill.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </details>
          )}
          <details>
            <summary>Raw OCR text</summary>
            <pre>{bill.rawText}</pre>
          </details>
          <p className="muted">Saved transactions: {getTransactions().length}</p>
        </div>
      )}
    </section>
  )
}
