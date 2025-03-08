import { Cursor, CustomHead, Scrollbar } from '@studio-freight/compono'
import { useDebug } from '@studio-freight/hamo'
import cn from 'clsx'
import { Footer } from 'components/footer'
import { Header } from 'components/header'
import dynamic from 'next/dynamic'
import s from './layout.module.scss'

const Orchestra = dynamic(
  () => import('lib/orchestra').then(({ Orchestra }) => Orchestra),
  { ssr: false },
)

export function Layout({
  seo = {
    title: 'Studio Vision - Creative Excellence',
    description:
      'Studio Vision is a creative studio focused on delivering exceptional digital experiences.',
    image: { url: 'https://studiovision.com/vision-og.jpg' },
    keywords: [
      'vision',
      'studio',
      'UX',
      'UI',
      'userexperience',
      'webdesign',
      'webdeveloper',
      'design',
      'codedesign',
      'code',
      'development',
      'website',
      'websitedevelopment',
      'webservices',
      'art direction',
      'strategy',
      'web',
      'photography',
      'video',
      'animation',
      'motion graphics',
      'branding',
    ],
  },
  children,
  theme = 'vision',
  className,
  principles,
  footerLinks,
  studioInfo,
  contactData,
}) {
  const debug = useDebug()

  return (
    <>
      <CustomHead {...seo} />

      <div className={cn(`theme-${theme}`, s.layout, className)}>
        <Cursor />
        <Scrollbar />
        <Header principles={principles} contact={contactData} />
        <main className={s.main}>{children}</main>
        <Footer links={footerLinks} studioInfo={studioInfo} />
      </div>

      {debug && (
        <>
          <Orchestra />
        </>
      )}
    </>
  )
}
