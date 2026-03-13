const DownloadButton = ({ 
  label = "Download Photos", 
  driveLink, 
  variant = "primary",
  icon = "download"
}) => {
  const handleDownload = () => {
    if (driveLink) {
      window.open(driveLink, '_blank')
    }
  }

  const baseClasses = "inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
  
  const variantClasses = {
    primary: "bg-[#F2A020] hover:bg-[#D89018] text-[#0B1120] font-medium px-6 py-3 rounded-lg shadow-lg shadow-[#F2A020]/30 hover:shadow-xl hover:shadow-[#F2A020]/50 hover:scale-[1.02]",
    secondary: "bg-transparent hover:bg-[#F2A020]/10 text-textPrimary hover:text-[#F2A020] font-medium px-6 py-3 rounded-lg border border-borderSubtle hover:border-[#F2A020]/40 shadow-md hover:shadow-lg hover:shadow-[#F2A020]/20",
    restricted: "bg-gradient-to-r from-[#F2A020] via-[#E89018] to-[#FF8800] hover:from-[#D89018] hover:via-[#D88010] hover:to-[#E87800] text-[#0B1120] font-medium px-6 py-3 rounded-lg shadow-lg shadow-[#F2A020]/40 hover:shadow-2xl hover:shadow-[#F2A020]/60 hover:scale-[1.02]"
  }

  const icons = {
    download: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    video: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    folder: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  }

  return (
    <button
      onClick={handleDownload}
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={!driveLink}
    >
      {icons[icon]}
      <span>{label}</span>
    </button>
  )
}

export default DownloadButton
