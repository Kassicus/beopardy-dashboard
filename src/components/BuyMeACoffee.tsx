import Image from "next/image";

export function BuyMeACoffee() {
  return (
    <div className="flex justify-center py-4 md:fixed md:bottom-4 md:right-4 md:py-0 md:z-50">
      <a
        href="https://www.buymeacoffee.com/kassicus"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-transform hover:scale-105"
        aria-label="Buy me a coffee"
      >
        <Image
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          width={217}
          height={60}
          className="h-10 w-auto"
          unoptimized
        />
      </a>
    </div>
  );
}
