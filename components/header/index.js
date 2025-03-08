import { Link, Marquee } from '@studio-freight/compono'
import { useMediaQuery } from '@studio-freight/hamo'
import va from '@vercel/analytics'
import cn from 'clsx'
import { ContactForm } from 'components/header/contact-form'
import { Separator } from 'components/separator'
import { StudioVisionBanner } from 'components/studio-vision-banner'
import { pad } from 'lib/maths'
import { useStore } from 'lib/store'
import dynamic from 'next/dynamic'
import s from './header.module.scss'

const Star = dynamic(() => import('icons/stard.svg'), { ssr: false })

export const Header = ({ principles = [], contact }) => {
  const isDesktop = useMediaQuery('(min-width: 800px)')
  const [contactIsOpen, setContactIsOpen] = useStore((state) => [
    state.contactIsOpen,
    state.setContactIsOpen,
  ])

  return (
    <header className={s.header}>
      <div className={s.top}>
        <div className={s.left}>
          <Link href="/" className={s.logo}>
            {isDesktop ? (
              <StudioVisionBanner className={s.title} />
            ) : (
              <StudioVisionBanner className={s.title} />
            )}
          </Link>
        </div>

        <div className={s.right}>
          <div className={s.principles}>
            {principles.map((principle, i) => (
              <div className={s.principle} key={i}>
                <p className="p-xs text-uppercase">
                  {pad(i + 1, 2)} {principle}
                </p>
                {i < principles.length - 1 && <Star className={s.star} />}
              </div>
            ))}
          </div>
          <button
            className={cn('p-s decorate', s.contact)}
            onClick={() => {
              va.track('Opened Contact Form')
              setContactIsOpen(!contactIsOpen)
            }}
          >
            {contactIsOpen ? 'close' : 'contact'}
          </button>
        </div>
      </div>
      <Separator />
      <div className={cn(s.marquee, contactIsOpen && s.hidden)}>
        <Marquee speed={isDesktop ? 1.5 : 0.5}>
          <p className="p-xs text-uppercase">
            Studio Vision is an independent creative studio crafting brands,
            digital experiences, and solutions that push missions to new
            heights.
          </p>
        </Marquee>
      </div>
      <div className={cn(s.form, !contactIsOpen && s.hidden)}>
        <ContactForm data={contact} />
      </div>
    </header>
  )
}
