import { BadgeCheck, CogSixTooth, GlobeEurope } from "@medusajs/icons"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const footerSections = [
  {
    heading: "Documentation",
    links: [
      {
        label: "Technical Documentation",
        href: "https://www.staluxautomation.com/technical-documentation",
      },
      {
        label: "CAD Files",
        href: "https://www.staluxautomation.com/cad-files",
      },
      {
        label: "Software Downloads",
        href: "https://www.staluxautomation.com/software-downloads",
      },
    ],
  },
  {
    heading: "Legal & Compliance",
    links: [
      {
        label: "Compliance",
        href: "https://www.staluxautomation.com/compliance",
      },
      {
        label: "Privacy Policy",
        href: "https://www.staluxautomation.com/privacy-policy",
      },
      {
        label: "Terms of Service",
        href: "https://www.staluxautomation.com/terms-of-service",
      },
    ],
  },
  {
    heading: "Corporate",
    links: [
      {
        label: "About Us",
        href: "https://www.staluxautomation.com/about-us",
      },
      {
        label: "Career Hub",
        href: "https://www.staluxautomation.com/careers",
      },
      {
        label: "Contact Engineering",
        href: "https://www.staluxautomation.com/contact-engineering",
      },
    ],
  },
]

const trustBadges = [
  {
    label: "Global operations",
    Icon: GlobeEurope,
  },
  {
    label: "Precision engineering",
    Icon: CogSixTooth,
  },
  {
    label: "Certified quality",
    Icon: BadgeCheck,
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-[#f4f6f8] px-3 pb-4 pt-10 small:px-5 small:pb-6 small:pt-14">
      <div className="mx-auto w-full max-w-[2000px] rounded-[20px] border border-[#202f44] bg-[#0b111a] px-6 py-10 small:px-10 small:py-12 medium:px-14 medium:py-14">
        <div className="grid gap-x-8 gap-y-12 medium:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <section>
            <LocalizedClientLink
              href="/"
              className="inline-block text-[clamp(1.8rem,2.6vw,2.5rem)] font-semibold uppercase tracking-[-0.015em] text-white"
            >
              Stalux Automation
            </LocalizedClientLink>
            <p className="mt-8 max-w-[26ch] text-[0.93rem] font-medium uppercase leading-[1.8] tracking-[0.18em] text-[#5d708e]">
              © {currentYear} Stalux Automation. Engineered for precision.
              Globally certified.
            </p>
            <ul className="mt-10 flex items-center gap-5 text-[#7288a7]">
              {trustBadges.map(({ label, Icon }) => (
                <li key={label}>
                  <span
                    className="inline-flex text-[#7288a7] transition-colors duration-200 hover:text-[#dce8fb]"
                    aria-label={label}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {footerSections.map((section) => {
            return (
              <section key={section.heading}>
                <h2 className="text-[0.92rem] font-semibold uppercase tracking-[0.34em] text-[#f6fbff]">
                  {section.heading}
                </h2>
                <ul className="mt-7 space-y-5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-[1rem] font-medium uppercase tracking-[0.16em] text-[#4f6484] transition-colors duration-200 hover:text-[#dce8fb]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
