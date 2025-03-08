import { Image } from '@studio-freight/compono'
import cn from 'clsx'
import s from './composable-image.module.scss'

export function ComposableImage({
  sources,
  width = 684,
  height = 403,
  large = false,
  small = false,
  priority = false,
  objectFit = 'cover',
}) {
  // Upravíme šířku a výšku pro lepší zobrazení
  const adjustedWidth = width
  const adjustedHeight = height

  return (
    <div className={s.images}>
      {sources.items.map((source) =>
        source.url.includes('videos.ctfassets.net') ? (
          <div
            className={cn(
              s.image,
              s.videoWrap,
              large && s.large,
              small && s.small,
            )}
            key={source.url}
          >
            <video
              src={source.url}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
            />
          </div>
        ) : (
          <Image
            key={source.url}
            src={source.url}
            alt={source.title}
            width={adjustedWidth}
            height={adjustedHeight}
            className={cn(s.image, large && s.large, small && s.small)}
            style={{
              objectFit: objectFit,
              backgroundColor: '#000',
            }}
            priority={priority}
            quality={95}
            sizes="(max-width: 768px) 100vw, 75vw"
            fill={false}
          />
        ),
      )}
    </div>
  )
}
