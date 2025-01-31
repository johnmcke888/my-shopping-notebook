import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">My Shopping Notebook</h1>
      
      <div className="space-x-4">
        <Link 
          href="/sign-in" 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Sign In
        </Link>
        <Link 
          href="/sign-up" 
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}