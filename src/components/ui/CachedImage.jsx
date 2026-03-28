import clsx from 'clsx'
import { useCachedImage } from '../../hooks/useCachedImage'

const CachedImage = ({ src, alt, className, fallbackClassName, ...imgProps }) => {
  const { cachedSrc, loading } = useCachedImage(src)

  return (
    <img
      src={cachedSrc || src}
      alt={alt}
      className={clsx(className, loading && fallbackClassName)}
      loading="lazy"
      {...imgProps}
    />
  )
}

export default CachedImage
