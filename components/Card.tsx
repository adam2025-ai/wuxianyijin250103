import Link from 'next/link'

interface CardProps {
  href: string
  title: string
  description: string
  icon?: React.ReactNode
}

export default function Card({ href, title, description, icon }: CardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}
