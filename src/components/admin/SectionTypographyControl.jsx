import TypographyStyleEditor from './TypographyStyleEditor'
import { resolveCaseTypography } from '../../lib/caseTypography'

export default function SectionTypographyControl({ project, section, role, elementId, sample, onChange, onReset, onUploadFont, availableFonts }) {
  const style = resolveCaseTypography(project, section, role, elementId)
  return <TypographyStyleEditor style={style} sample={sample} onChange={onChange} onReset={onReset} onUploadFont={onUploadFont} availableFonts={availableFonts} />
}
