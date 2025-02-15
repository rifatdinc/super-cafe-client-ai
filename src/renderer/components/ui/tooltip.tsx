import { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}

export function Tooltip({ children, content, side = 'top', delayDuration = 200 }: TooltipProps) {
  return (
    <div className="relative group w-full">
      {children}
      <div
        className={`absolute z-50 px-2 py-1 text-sm bg-popover text-popover-foreground rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
          side === 'right'
            ? 'left-full top-1/2 -translate-y-1/2 ml-2'
            : side === 'left'
            ? 'right-full top-1/2 -translate-y-1/2 mr-2'
            : side === 'bottom'
            ? 'top-full left-1/2 -translate-x-1/2 mt-2'
            : 'bottom-full left-1/2 -translate-x-1/2 mb-2'
        }`}
        style={{ transitionDelay: `${delayDuration}ms` }}
      >
        {content}
      </div>
    </div>
  )
}
