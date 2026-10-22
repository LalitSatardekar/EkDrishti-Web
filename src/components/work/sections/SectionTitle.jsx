import TypographyText from './TypographyText'

export default function SectionTitle({ section, project, as: Tag = 'h2', children, ...props }) {
  return <TypographyText {...props} project={project} section={section} role="sectionHeading" as={Tag}>{children}</TypographyText>
}
