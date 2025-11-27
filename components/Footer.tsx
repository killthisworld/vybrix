import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 text-center border-t border-purple-400/10 bg-black/50 backdrop-blur-sm z-50">
      <p className="text-purple-300/60 text-sm">
        Questions? Feedback?{' '}
        <a 
          href="mailto:vybrix.help@gmail.com" 
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          vybrix.help@gmail.com
        </a>
      </p>
    </footer>
  );
}
