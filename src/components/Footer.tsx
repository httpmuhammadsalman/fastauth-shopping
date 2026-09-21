import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

const linkClass = "text-zinc-400 transition hover:text-white";

export default function Footer() {
  return (
    <footer className="mt-12 bg-zinc-950 text-sm text-zinc-400">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Image src="/logo-white.png" alt={site.name} width={130} height={35} />
          <p>{site.tagline}</p>
          <p className="text-xs text-zinc-500">
            Demo storefront. Payments are processed securely by {site.name}.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Shop</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className={linkClass}>
                Products
              </Link>
            </li>
            <li>
              <Link href="/cart" className={linkClass}>
                Cart
              </Link>
            </li>
            <li>
              <Link href="/docs" className={linkClass}>
                Developer Docs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Company</h3>
          <ul className="space-y-2">
            <li>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                About {site.name}
              </a>
            </li>
            <li>
              <a href={site.links.features} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Features
              </a>
            </li>
            <li>
              <a href={site.links.pricing} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Pricing
              </a>
            </li>
            <li>
              <a href={site.links.contact} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Support</h3>
          <ul className="space-y-2">
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            <li>{site.hours}</li>
            <li>{site.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href={site.links.terms} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Terms of Use
            </a>
            <a href={site.links.privacy} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
