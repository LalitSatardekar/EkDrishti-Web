export default function AdminMemory() {
  const sections = [
    {
      title: '📁 Project Directory Structure',
      content: `
- **/api/v1/**: Serverless endpoints for Vercel deployment.
  - **/auth/**: Session credentials and tokens validator.
- **/api/lib/**: Cached database controllers, log trails, and auth wrappers.
- **/api/models/**: Mongoose schemas (Case, Contact, User, Log).
- **/src/**: Vite dynamic React client.
  - **/components/**: UI abstractions and layouts.
  - **/context/**: Central state managers (Auth, Cases).
  - **/pages/**: Agency public and secure admin views.
- **/scripts/**: Verification utilities and database seeding tools.
      `
    },
    {
      title: '🌐 API Endpoint Directory',
      content: `
- **POST /api/v1/auth/login**: Processes credentials, logs session start, and returns JWT.
- **GET /api/v1/auth/me**: Session validation checker.
- **GET /api/v1/cases**: Public listing fetch (published only) or admin details fetch.
- **POST /api/v1/cases**: Inserts portfolio case.
- **PUT /api/v1/cases**: Edits case settings or nested section parameters.
- **DELETE /api/v1/cases**: Remotely removes case file from database.
- **POST /api/v1/upload**: Dynamic WebP sharp optimizer S3 uploader.
- **POST /api/v1/contact**: Contact inquiry logger and Nodemailer SMTP dispatcher.
- **GET /api/v1/contact**: Leads CRM dashboard list.
- **GET /api/v1/logs**: System activity audits trail.
- **GET /api/v1/dashboard**: Consolidated metrics overview statistics.
      `
    },
    {
      title: '💽 Schema Definitions',
      content: `
- **Case**: title, slug, description, service, category, status, image, thumbnail, thumbnail32, thumbnail169, hero: [String], album: [String], sections: [SectionSchema], deleted_at, deleted_by.
- **Contact**: name, email, phone, service, message, status (unread/read/archived/assigned/resolved), ip, userAgent, utm_source, utm_medium, utm_campaign, landingPage, referrer, deleted_at.
- **User**: username, password_hash, role, created_at.
- **Log**: user, action, resource, outcome, details, created_at.
      `
    },
    {
      title: '⚙️ Environmental Keys (.env)',
      content: `
- **MONGODB_URI**: target MongoDB connection path.
- **JWT_SECRET**: hash key signature for sessions.
- **SMTP_HOST** / **SMTP_PASSWORD**: nodemailer SMTP configurations.
- **AWS_ACCESS_KEY_ID** / **AWS_SECRET_ACCESS_KEY**: storage upload keys.
- **AWS_S3_BUCKET** / **AWS_REGION**: target bucket configs.
      `
    }
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Project Memory</h1>
        <p className="text-textSecondary text-xs">Internal developer manual mapping repository structure, API specs, and schemas</p>
      </div>

      {/* RENDER SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-[#0F172A]/40 border border-white/5 p-6 rounded-2xl space-y-3">
            <h2 className="text-sm font-heading font-bold text-amber-400 uppercase tracking-wider">{sec.title}</h2>
            <div className="h-px bg-white/5" />
            <pre className="text-textSecondary text-[10px] leading-relaxed font-mono whitespace-pre-wrap select-text">
              {sec.content.trim()}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
