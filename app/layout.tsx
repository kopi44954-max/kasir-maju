import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable}`}>
      <body className="bg-[#07080A] text-slate-300 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}