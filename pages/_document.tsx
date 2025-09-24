import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script src="https://js.paystack.co/v2/inline.js" async></script>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        </style>
        <script
          type="application/id+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "DTwears",
              url: "https://dtwears.ng",
              logo: "https://dtwears.ng/logo2.png",
            }),
          }}
        />
        <meta
          name="description"
          content="Shop premium sneakers and jerseys online"
        />
        <meta
          property="og:description"
          content="Shop premium sneakers online"
        />
        <meta
          property="og:image"
          content="https://www.dtwears.ng/images/sneakers.webp"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://dtwears.ng" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DTwears" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DTwears" />
        <meta
          name="twitter:description"
          content="Shop premium sneakers online"
        />
        <meta
          name="twitter:image"
          content="https://www.dtwears.ng/images/sneakers.jpg"
        />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="628" />
        <link rel="canonical" href="https://dtwears.ng" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
