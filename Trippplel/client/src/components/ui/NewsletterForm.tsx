"use client";

export default function NewsletterForm() {
  return (
    <form className="flex w-full max-w-sm gap-0" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-accent transition-colors"
      />
      <button
        type="submit"
        className="bg-accent text-black px-5 py-3 text-xs font-black tracking-widest uppercase hover:bg-yellow-300 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
