import { Link } from 'react-router-dom'

export function NotFoundPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to={ '/'}
        className="mt-8 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go back home
      </Link>
    </div>
  )
}
