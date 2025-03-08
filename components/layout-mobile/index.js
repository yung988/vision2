import { Image } from '@studio-freight/compono'
import cn from 'clsx'
import { ProjectAccordion } from 'components/project-accordion'
import { renderer } from 'contentful/renderer'
import s from './layout-mobile.module.scss'

const LayoutMobile = ({ projects, studioVision }) => {
  return (
    <div className={s.content}>
      <section className={s['hero-image']}>
        <Image
          src="/android-chrome-512x512.png"
          alt="Studio Vision hero image"
          fill
        />
      </section>
      <section className={cn(s.projects, 'layout-block')}>
        <ProjectAccordion data={projects.items} />
      </section>
      <section className={s.image}>
        <Image
          src={'/android-chrome-192x192.png'}
          alt={'Studio Vision game boy'}
          fill
        />
      </section>
      <section className={cn(s.about, 'layout-block')}>
        <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
          About
        </p>
        <div className={s.description}>{renderer(studioVision.about)}</div>
      </section>
    </div>
  )
}

export { LayoutMobile }
