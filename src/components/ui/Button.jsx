import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark',
  outline: 'border border-slate-300 bg-white text-navy hover:border-primary hover:text-primary',
  light: 'bg-white text-primary hover:bg-mist',
  ghost: 'text-navy hover:bg-slate-100',
}

export default function Button({ children, to, href, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl px-5 py-3 text-center text-sm font-bold transition duration-200 ${variants[variant]} ${className}`

  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  if (href) return <a href={href} className={classes} {...props}>{children}</a>
  return <button className={classes} {...props}>{children}</button>
}
