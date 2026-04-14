export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md text-center">
        
        <div className="text-4xl mb-4">📬</div>
        
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          check your inbox
        </h1>
        
        <p className="text-stone-500 text-sm leading-relaxed">
          we just sent you a magic link. click it and you'll be right in — no password needed.
        </p>

        <p className="text-stone-400 text-xs mt-6">
          didn't get it? check your spam folder.
        </p>
      </div>
    </main>
  )
}