import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconMedium from "@/assets/icons/IconMedium.svg";
import IconTryHackMe from "@/assets/icons/IconTryHackMe.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

interface ShareLink {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/Manas-salian",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "X",
    href: "https://x.com/Manas_Salian_",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/manassalian/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Medium",
    href: "https://medium.com/@salianmanas",
    linkTitle: `${SITE.title} on Medium`,
    icon: IconMedium,
  },
  {
    name: "TryHackMe",
    href: "https://tryhackme.com/p/manas.cs23",
    linkTitle: `${SITE.title} on TryHackMe`,
    icon: IconTryHackMe,
  },
  {
    name: "Mail",
    href: "mailto:salianmanas@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS: ShareLink[] = [
  {
    name: "X",
    href: "https://x.com/intent/tweet?url=",
    linkTitle: "Share on X",
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: "Share on LinkedIn",
    icon: IconLinkedin,
  },
];
