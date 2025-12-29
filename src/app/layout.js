import './globals.css';

export const metadata = {
  title: 'Points & Screen Time | Cloud Sync',
  description: 'Manage screen time with a visual points system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

