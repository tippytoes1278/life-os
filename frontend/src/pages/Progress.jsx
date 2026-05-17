import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const configured    = CLOUD_NAME && CLOUD_NAME !== 'your_cloud_name'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PhotoCard({ photo }) {
  const label = photo.photo_type === 'front' ? '📸 Front' : photo.photo_type === 'side' ? '🔄 Side' : '📷 Other'
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <img src={photo.photo_url} alt={photo.photo_type} className="w-full aspect-[3/4] object-cover" />
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400">{label}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{formatDate(photo.logged_at)}</p>
        </div>
        {photo.weight_kg && (
          <span className="text-sm font-bold text-rose-400 tabular-nums">{photo.weight_kg} kg</span>
        )}
      </div>
    </div>
  )
}

export default function Progress() {
  const [photos, setPhotos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [weight, setWeight]   = useState('')
  const [uploading, setUploading] = useState(null) // 'front' | 'side' | null
  const [error, setError]     = useState('')
  const frontRef = useRef(null)
  const sideRef  = useRef(null)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    supabase.from('progress_photos').select('*').order('logged_at', { ascending: false })
      .then(({ data }) => { setPhotos(data || []); setLoading(false) })
  }, [])

  async function handleUpload(file, type) {
    if (!file) return
    setUploading(type); setError('')

    if (!configured) {
      setError('Configure Cloudinary in frontend/.env.local to enable photo uploads.')
      setUploading(null); return
    }

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', UPLOAD_PRESET)
      fd.append('folder', 'life-os/progress')

      const cloudRes  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      const cloudData = await cloudRes.json()
      if (!cloudData.secure_url) throw new Error(cloudData.error?.message || 'Upload failed')

      const { data, err } = await supabase
        .from('progress_photos')
        .insert({ photo_url: cloudData.secure_url, photo_type: type, weight_kg: weight || null })
        .select().single()
      if (err) throw new Error(err.message)
      setPhotos((prev) => [data, ...prev])
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(null)
    }
  }

  const inputCls = 'bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors'

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-1">Progress</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Add Photo</p>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Weight (kg) — optional</label>
          <input type="number" min="20" max="300" step="0.1" value={weight}
            onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75.5" className={`w-full ${inputCls}`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['front', '📸 Front Photo', frontRef], ['side', '🔄 Side Photo', sideRef]].map(([type, label, ref]) => (
            <button key={type} type="button"
              onClick={() => ref.current?.click()}
              disabled={!!uploading}
              className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                uploading === type
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}>
              {uploading === type ? 'Uploading…' : label}
            </button>
          ))}
        </div>
        <input ref={frontRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0], 'front')} />
        <input ref={sideRef}  type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0], 'side')} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!configured && <p className="text-xs text-zinc-600 italic">Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local to enable uploads.</p>}
      </div>

      <div className="px-4 pb-10">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">Timeline</p>
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-8">Loading…</p>
          : photos.length === 0
            ? <p className="text-center text-sm text-zinc-600 py-8">No photos yet.</p>
            : <div className="grid grid-cols-2 gap-3">
                {photos.map((p) => <PhotoCard key={p.id} photo={p} />)}
              </div>
        }
      </div>
    </div>
  )
}
