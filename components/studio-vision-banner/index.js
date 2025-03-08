import { cn } from '../../lib/utils'

export function StudioVisionBanner({ className }) {
  return (
    <div className={cn('py-12 px-6', className)}>
      <h1 className="text-[12vw] font-bold tracking-tight text-purple-600 leading-none">
        STUDIO VISION
        <span className="text-[1vw] align-super text-purple-500 ml-[0.5vw]">
          TM
        </span>
      </h1>
    </div>
  )
}
