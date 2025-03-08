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
      {sources.items.map((source, index) => {
        // První obrázek bude na celou šířku, pokud jsou alespoň 3 obrázky
        const isFullWidth = index === 0 && sources.items.length >= 3

        return source.url.includes('videos.ctfassets.net') ? (
          <div
            className={cn(
              s.image,
              s.videoWrap,
              large && s.large,
              small && s.small,
              isFullWidth && s.fullWidth,
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
            className={cn(
              s.image,
              large && s.large,
              small && s.small,
              isFullWidth && s.fullWidth,
            )}
            style={{
              objectFit: objectFit,
              backgroundColor: '#000',
              objectPosition: 'center',
            }}
            priority={priority || index === 0} // První obrázek má vždy prioritu
            quality={95}
            sizes="(max-width: 768px) 100vw, 75vw"
            fill={false}
          />
        )
      })}
    </div>
  )
}
