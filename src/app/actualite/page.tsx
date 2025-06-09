import Script from "next/script";

export default function MyComponent() {
  return (
    <>
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="lazyOnload"
      />
      <div
        className="elfsight-app-94d870b0-6293-4fa6-81e3-f868db546400"
        data-elfsight-app-lazy
      />
    </>
  );
}
