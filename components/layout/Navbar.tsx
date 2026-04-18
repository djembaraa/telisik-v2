import Link from "next/link";
import Image from "next/image";
import DesktopMenu from "./DesktopMenu";
import DesktopActions from "./DesktopAction";
import MobileTopBar from "./MobileTopBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[50] w-full bg-[#F9F6EF] dark:bg-[#403E3C] border-b border-neutral-200 dark:border-neutral-800">
      <div className="w-full px-4 lg:px-8 h-[50px] lg:h-[65px] flex items-center justify-between">
        <div className="hidden lg:flex items-center shrink-0">
          <Link href="/">
            <Image
              src="/telisik-logo.svg"
              alt="Telisik Logo"
              width={80}
              height={48}
              className="w-[60px] h-[32px] min-[1440px]:w-[78px] min-[1440px]:h-[46px]"
              priority
            />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 justify-center min-[1440px]:pr-34">
          <DesktopMenu />
        </div>

        <div className="hidden lg:flex shrink-0">
          <DesktopActions />
        </div>

        <MobileTopBar />
      </div>
    </header>
  );
}
