export interface NavItemType {
  id: string;
  label: string;
  href: string;
  iconPath: string;
}

export const MAIN_NAVIGATION: NavItemType[] = [
  {
    id: "beranda",
    label: "Beranda",
    href: "/",
    iconPath: "/menus/beranda.svg",
  },
  {
    id: "kronik",
    label: "Kronik",
    href: "/article/kronik",
    iconPath: "/menus/kronik.svg",
  },
  {
    id: "tilik",
    label: "Tilik",
    href: "/article/tilik",
    iconPath: "/menus/tilik.svg",
  },
  {
    id: "diskursus",
    label: "Diskursus",
    href: "/article/diskursus",
    iconPath: "/menus/diskursus.svg",
  },
  {
    id: "profil",
    label: "Profil",
    href: "/profil",
    iconPath: "/menus/profil.svg",
  },
];