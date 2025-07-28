import * as React from "react"
import { cn } from "../../lib/utils"
import { colors } from "../../styles/tokens/colors"
import { typography } from "../../styles/tokens/typography"

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'client' | 'admin'
  size?: 'sm' | 'md' | 'lg'
}

const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ children, variant = 'client', size = 'md', className, ...props }, ref) => {
    const variantStyles = {
      client: `text-white shadow-md transition-colors duration-200`,
      admin: `text-white shadow-md transition-colors duration-200`
    }
    
    const sizeStyles = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-base",  
      lg: "px-6 py-3 text-lg"
    }

    // Dynamic styles using design tokens
    const buttonStyle = {
      backgroundColor: variant === 'client' ? colors.client.primary : colors.admin.primary,
      fontFamily: typography.fontFamily.sura.join(', ')
    }

    const hoverStyle = {
      backgroundColor: variant === 'client' ? colors.client.secondary : colors.admin.secondary
    }

    return (
      <button
        ref={ref}
        style={buttonStyle}
        className={cn(
          "rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

BrandButton.displayName = "BrandButton"

export { BrandButton }