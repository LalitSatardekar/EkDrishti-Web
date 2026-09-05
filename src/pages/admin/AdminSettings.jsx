import { useState } from 'react'

export default function AdminSettings() {
  const [successMsg, setSuccessMsg] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setSuccessMsg('Settings saved locally (Note: Some parameters require server redeployment).')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Global Settings</h1>
        <p className="text-textSecondary text-xs">Configure site defaults, environment parameters, and metadata rules</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          ✓  {successMsg}
        </div>
      )}

      {/* SETTINGS CARD CONTAINER */}
      <div className="max-w-3xl bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* General Email Pipeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-heading font-bold text-white border-b border-white/5 pb-2">Email Routing (Nodemailer SMTP)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Recipient Email</label>
                <input
                  type="email"
                  defaultValue="tanmayjare29@gmail.com"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
                <span className="text-[9px] text-textSecondary/50 block mt-1">Controlled by RECIPIENT_EMAIL in env</span>
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Sender Identity</label>
                <input
                  type="text"
                  defaultValue="onboarding@resend.dev"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
                <span className="text-[9px] text-textSecondary/50 block mt-1">Controlled by SENDER_ADDRESS in env</span>
              </div>
            </div>
          </div>

          {/* S3 asset host routing */}
          <div className="space-y-3">
            <h2 className="text-sm font-heading font-bold text-white border-b border-white/5 pb-2">AWS Asset Pipelines</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">AWS S3 WebP Path</label>
                <input
                  type="text"
                  defaultValue="https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/webp/"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">AWS S3 Original Path</label>
                <input
                  type="text"
                  defaultValue="https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/original/"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          {/* Google Analytics configs */}
          <div className="space-y-3">
            <h2 className="text-sm font-heading font-bold text-white border-b border-white/5 pb-2">Analytics & Integrations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">GA4 Measurement ID</label>
                <input
                  type="text"
                  defaultValue="G-59FWNMNZE6"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Default Image Format</label>
                <input
                  type="text"
                  defaultValue="webp"
                  readOnly
                  className="w-full px-3 py-2.5 bg-[#0B1120]/60 border border-white/5 rounded-xl text-textSecondary cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-primary font-bold py-2.5 px-6 rounded-xl transition-all font-heading"
            >
              Save Configuration
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
