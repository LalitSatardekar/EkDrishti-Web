const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'font-medium px-6 py-3 rounded-lg transition-all duration-300'
  
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white',
    secondary: 'bg-transparent hover:bg-surface text-textPrimary border border-borderSubtle',
    accent: 'bg-gradient-to-r from-accent to-accentLight text-white hover:shadow-lg hover:shadow-accent/50',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
