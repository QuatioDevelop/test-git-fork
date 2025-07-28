import * as React from "react"
import { cn } from "../../lib/utils"
import { colors } from "../../styles/tokens/colors"
import { typography } from "../../styles/tokens/typography"

interface BrandHeaderProps {
  title: string
  subtitle?: string
  className?: string
  variant?: 'client' | 'admin'
}

const BrandHeader = React.forwardRef<
  HTMLDivElement,
  BrandHeaderProps
>(({ title, subtitle, className, variant = 'client', ...props }, ref) => {
  const headerStyle = {
    backgroundColor: variant === 'client' ? colors.client.primary : colors.admin.primary,
    color: colors.white,
    fontFamily: typography.fontFamily.sura.join(', ')
  }

  return (
    <header
      ref={ref}
      style={headerStyle}
      className={cn(
        "border-b transition-all duration-300 shadow-lg",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 py-6">
        <h1 
          className="text-3xl font-bold"
          style={{ 
            fontSize: typography.fontSize['3xl'].size,
            lineHeight: typography.fontSize['3xl'].lineHeight,
            fontWeight: typography.fontWeight.bold
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className="mt-2 opacity-90"
            style={{
              fontSize: typography.fontSize.base.size,
              lineHeight: typography.fontSize.base.lineHeight,
              fontWeight: typography.fontWeight.regular
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
})

BrandHeader.displayName = "BrandHeader"

export { BrandHeader }