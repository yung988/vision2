import dynamic from 'next/dynamic'
import { cn } from '../../lib/utils'

const VisionLogo = dynamic(() => import('icons/vision-logo.svg'), {
  ssr: false,
})
const VisionLogoMobile = dynamic(() => import('icons/vision-logo-mobile.svg'), {
  ssr: false,
})

export function StudioVisionBanner({ className, isMobile }) {
  return (
    <div className={cn('py-4', className)}>
      {isMobile ? (
        <VisionLogoMobile className="w-full" />
      ) : (
        <VisionLogo className="w-full" />
      )}
    </div>
  )
}
