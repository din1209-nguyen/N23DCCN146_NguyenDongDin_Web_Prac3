import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position='top-right' />
        </Providers>
      </body>
    </html>
  );
}