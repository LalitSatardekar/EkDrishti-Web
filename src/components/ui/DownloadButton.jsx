import { accessDestination } from '../../lib/clientAccess'
import { trackButtonClick } from '../../lib/analytics'
import TypographyText from '../work/sections/TypographyText'

export function ButtonIcon({ name, size }) {
  const paths = { folder:'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', download:'M4 16v3h16v-3M12 3v12m-5-5 5 5 5-5', video:'m15 10 6-3v10l-6-3M3 6h12v12H3z', link:'m10 13 4-4m-6 6-2 2a4 4 0 01-6-6l4-4a4 4 0 016 0m-2 2 2-2a4 4 0 016 6l-4 4a4 4 0 01-6 0', mail:'M3 5h18v14H3z m0 0 9 8 9-8', phone:'M5 3h4l2 5-3 2a14 14 0 006 6l2-3 5 2v4c-12 4-22-6-16-16z', whatsapp:'M20 11a8 8 0 01-12 7l-5 2 2-5A8 8 0 1120 11z M8 7c0 5 3 8 7 8' }
  if (!paths[name]) return null
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d={paths[name]} /></svg>
}

const DownloadButton = ({
  label = "Download Photos",
  driveLink,
  variant = "primary",
  icon = "download",
  typographyProject = null,
  typographySection = null
}) => {
  const handleDownload = () => {
    const destination = accessDestination({ type: 'external', value: driveLink })
    if (destination.href) {
      trackButtonClick(label, 'download_button', { icon })
      window.open(destination.href, '_blank', 'noopener,noreferrer')
    }
  }

  const baseClasses = "inline-flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
  
  const variantClasses = {
    primary: "bg-[#F2A020] hover:bg-[#D89018] text-[#0B1120] font-medium px-6 py-3 rounded-lg shadow-lg shadow-[#F2A020]/30 hover:shadow-xl hover:shadow-[#F2A020]/50 hover:scale-[1.02]",
    secondary: "bg-transparent hover:bg-[#F2A020]/10 text-textPrimary hover:text-[#F2A020] font-medium px-6 py-3 rounded-lg border border-borderSubtle hover:border-[#F2A020]/40 shadow-md hover:shadow-lg hover:shadow-[#F2A020]/20",
    restricted: "bg-gradient-to-r from-[#F2A020] via-[#E89018] to-[#FF8800] hover:from-[#D89018] hover:via-[#D88010] hover:to-[#E87800] text-[#0B1120] font-medium px-6 py-3 rounded-lg shadow-lg shadow-[#F2A020]/40 hover:shadow-2xl hover:shadow-[#F2A020]/60 hover:scale-[1.02]"
  }


  return (
    <button
      onClick={handleDownload}
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={!accessDestination({ type: 'external', value: driveLink }).href}
    >
      <ButtonIcon name={icon} size={20} />
      <TypographyText as="span" role="button" project={typographyProject} section={typographySection}>{label}</TypographyText>
    </button>
  )
}

export default DownloadButton
