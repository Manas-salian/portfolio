import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/Manas-salian",
  },
  {
    name: "X",
    href: "https://x.com/Manas_Salian_",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/manassalian/",
  },
  {
    name: "Medium",
    href: "https://medium.com/@salianmanas",
  },
  {
    name: "TryHackMe",
    href: "https://tryhackme.com/p/manas.cs23",
  },
  {
    name: "Email",
    href: "mailto:salianmanas@gmail.com",
  },
] as const;
