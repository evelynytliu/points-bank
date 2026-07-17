import './globals.css';

export const metadata = {
  metadataBase: new URL('https://points-bank.vercel.app'),
  title: {
    default: 'Points Bank 親子點數銀行｜讓螢幕時間變成孩子的成就感',
    template: '%s | Points Bank',
  },
  description: '孩子用好表現賺點數、兌換螢幕時間、為願望儲蓄；家長輕鬆建立溫和且一致的家庭規則。免費使用，1 分鐘完成設定。',
  keywords: ['親子', '點數銀行', '螢幕時間管理', '兒童獎勵', '正向教養', 'screen time', 'family points', 'kids rewards'],
  applicationName: 'Points Bank',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Points Bank',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://points-bank.vercel.app',
    siteName: 'Points Bank',
    title: 'Points Bank 親子點數銀行｜讓螢幕時間變成孩子的成就感',
    description: '孩子用好表現賺點數、兌換螢幕時間、為願望儲蓄；家長輕鬆建立溫和且一致的家庭規則。',
    images: [{ url: '/hero_warm.png', width: 1024, height: 1024, alt: 'Points Bank 親子點數銀行' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Points Bank 親子點數銀行',
    description: '讓螢幕時間變成孩子的成就感。',
    images: ['/hero_warm.png'],
  },
  icons: {
    icon: '/logo_24px.svg',
    shortcut: '/logo_24px.svg',
    apple: '/logo_webicon.png',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdfbf7',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WX5VQK2V');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/earlyaccess/cwtexyen.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Outfit:wght@500;800&family=Gaegu:wght@400;700&family=M+PLUS+Rounded+1c:wght@700;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WX5VQK2V"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

