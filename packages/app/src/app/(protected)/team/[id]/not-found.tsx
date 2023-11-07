import Link from 'next/link'

export default async function NotFound() {
  return (
    <div>
      <h2>Team not found</h2>
      <p>Could not find requested team</p>
      <p>
        View <Link href="/">Home</Link>
      </p>
    </div>
  )
}
