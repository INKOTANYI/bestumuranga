import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="mt-auto bg-sky-950 text-sky-100 border-t border-sky-800/80">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col items-center gap-4 text-sm">
        {/* Social links row */}
        <div className="flex flex-wrap items-center justify-center gap-5 mb-1">
          <a
            href="https://wa.me/250783163187"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white mr-1">W</span>
            <span>WhatsApp</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Twitter className="w-4 h-4" />
            <span>Twitter</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1.5 hover:text-white">
            <Youtube className="w-4 h-4" />
            <span>YouTube</span>
          </a>
        </div>

        {/* Brand + quick links */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-base font-semibold tracking-wide">
            Bestumuranga.com
          </div>
          <div className="flex items-center gap-4 text-xs text-sky-100/90">
            <a href="/#promoted-ads" className="hover:text-white underline-offset-2 hover:underline">
              View listings
            </a>
            <span className="h-3 w-px bg-sky-700" />
            <Link to="/register-broker" className="hover:text-white underline-offset-2 hover:underline">
              Register as broker
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-sky-200/85">
          © 2025 Bestumuranga.com - All rights reserved
        </div>
      </div>
    </footer>
  )
}
