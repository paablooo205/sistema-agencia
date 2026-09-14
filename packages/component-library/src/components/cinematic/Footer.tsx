"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface FooterNavColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterContactPerson {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface FooterLegalLink {
  label: string;
  href: string;
}

export type FooterBrandMarkTreatment = "solid" | "ghost";
export type FooterEnter = "none" | "fade-up";

export interface FooterProps {
  brandName: string;
  brandMarkTreatment?: FooterBrandMarkTreatment;
  navColumns?: FooterNavColumn[];
  contactGeneral?: { phone?: string; email?: string };
  contactPeople?: FooterContactPerson[];
  socialLinks?: FooterSocialLink[];
  copyrightText?: string;
  legalLinks?: FooterLegalLink[];
  enter?: FooterEnter;
  children?: ReactNode;
  className?: string;
}

const DEFAULT_BRAND_MARK_TREATMENT: FooterBrandMarkTreatment = "ghost";
const DEFAULT_ENTER: FooterEnter = "none";

export function Footer({
  brandName,
  brandMarkTreatment = DEFAULT_BRAND_MARK_TREATMENT,
  navColumns,
  contactGeneral,
  contactPeople,
  socialLinks,
  copyrightText,
  legalLinks,
  enter = DEFAULT_ENTER,
  children,
  className,
}: FooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const content = contentRef.current;
    // Same opt-in-only default as CinematicScene — a footer is the least
    // "spectacle" zone on the page, so no animation unless asked for.
    if (!footer || !content || enter === "none") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    // Trigger = outer <footer>, animated target = inner wrapper — not the
    // same element, for the same reason documented in CinematicScene: a
    // transform on the trigger itself feeds back into ScrollTrigger's own
    // position calculation and the animation never visibly completes.
    const tween = gsap.fromTo(
      content,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: footer,
          start: "top 90%",
          end: "top 50%",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [enter]);

  const hasGeneralContact = Boolean(
    contactGeneral?.phone || contactGeneral?.email,
  );
  const hasContact = hasGeneralContact || Boolean(contactPeople?.length);
  const hasLegal = Boolean(copyrightText || legalLinks?.length);
  const isSolid = brandMarkTreatment === "solid";

  return (
    <footer
      ref={footerRef}
      className={["relative overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={contentRef}
        className={[
          "relative z-10 px-6 pt-16 sm:px-10",
          // The solid treatment is opaque and can't rely on low opacity to
          // stay legible if it overlaps real content — so it gets its own
          // reserved strip below everything else instead. The ghost
          // treatment doesn't need this: its faintness is itself the
          // safety margin, so it's free to bleed under the last content
          // row without risking legibility.
          isSolid ? "pb-32 sm:pb-40 md:pb-48" : "pb-16",
        ].join(" ")}
      >
        {navColumns && navColumns.length > 0 && (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            {navColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="mb-3 text-sm font-medium uppercase tracking-wide opacity-60">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-sm hover:underline">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}

        {hasContact && (
          <address className="mt-12 flex flex-col gap-6 not-italic sm:flex-row sm:flex-wrap sm:gap-10">
            {hasGeneralContact && (
              <div>
                {contactGeneral?.phone && (
                  <p className="text-sm">
                    <a href={`tel:${contactGeneral.phone}`}>
                      {contactGeneral.phone}
                    </a>
                  </p>
                )}
                {contactGeneral?.email && (
                  <p className="text-sm">
                    <a href={`mailto:${contactGeneral.email}`}>
                      {contactGeneral.email}
                    </a>
                  </p>
                )}
              </div>
            )}
            {contactPeople?.map((person) => (
              <div key={person.name}>
                <p className="text-sm font-medium">
                  {person.name}
                  {person.role ? ` — ${person.role}` : ""}
                </p>
                {person.phone && (
                  <p className="text-sm">
                    <a href={`tel:${person.phone}`}>{person.phone}</a>
                  </p>
                )}
                {person.email && (
                  <p className="text-sm">
                    <a href={`mailto:${person.email}`}>{person.email}</a>
                  </p>
                )}
              </div>
            ))}
          </address>
        )}

        {socialLinks && socialLinks.length > 0 && (
          <ul className="mt-12 flex gap-4">
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a href={social.href} aria-label={social.label}>
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        )}

        {children && <div className="mt-12">{children}</div>}

        {hasLegal && (
          <div className="mt-16 flex flex-col gap-2 border-t border-foreground/10 pt-6 text-xs opacity-70 sm:flex-row sm:items-center sm:justify-between">
            {copyrightText && <p>{copyrightText}</p>}
            {legalLinks && legalLinks.length > 0 && (
              <ul className="flex gap-4">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Decorative wordmark, not real content — oversized-wordmark-footer.md
          calls this exact technique "firma de marca sin competir con el
          mensaje real". aria-hidden + pointer-events-none keeps it out of
          the accessibility tree and unclickable. No explicit text color
          here on purpose — it inherits `currentColor` from whatever text
          color the footer ends up with (default or via `className`), so
          it can never end up dark-on-dark or light-on-light when a caller
          overrides the footer's colors. */}
      <p
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 z-0 select-none whitespace-nowrap",
          "text-center font-black leading-none tracking-tight",
          isSolid
            ? "bottom-4 text-[clamp(3rem,14vw,10rem)] opacity-100 sm:bottom-6"
            : "bottom-0 translate-y-1/4 text-[clamp(3rem,16vw,12rem)] opacity-[0.05]",
        ].join(" ")}
      >
        {brandName}
      </p>
    </footer>
  );
}
