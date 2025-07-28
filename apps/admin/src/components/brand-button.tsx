import * as React from "react"
import { cn } from "@/lib/utils"

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'client' | 'admin'
  size?: 'sm' | 'md' | 'lg'
}

const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ children, variant = 'client', size = 'md', className, ...props }, ref) => {
    const variantStyles = {
      client: "bg-blue-600 hover:bg-blue-700 text-white",
      admin: "bg-blue-700 hover:bg-blue-800 text-white"
    }
    
    const sizeStyles = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-base",  
      lg: "px-6 py-3 text-lg"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-md font-medium transition-colors duration-200 shadow-md",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

BrandButton.displayName = "BrandButton"

export { BrandButton }