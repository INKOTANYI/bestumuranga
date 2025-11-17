import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="mt-auto bg-sky-900 text-sky-100 border-t border-sky-800">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 flex flex-col items-center gap-3 text-xs">
        {/* Social links row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-1">
          <a href="#" className="inline-flex items-center gap-1 hover:text-white">
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1 hover:text-white">
            <Twitter className="w-3.5 h-3.5" />
            <span>Twitter</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1 hover:text-white">
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1 hover:text-white">
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
          <a href="#" className="inline-flex items-center gap-1 hover:text-white">
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube</span>
          </a>
        </div>

        {/* Brand + quick links */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-semibold tracking-wide">
            Bestumuranga.com
          </div>
          <div className="flex items-center gap-3 text-[11px] text-sky-100/90">
            <a href="/#promoted-ads" className="hover:text-white underline-offset-2 hover:underline">
              View listings
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-sky-200/80">
          © 2025 Bestumuranga.com - All rights reserved
        </div>
      </div>
    </footer>
  )
}
