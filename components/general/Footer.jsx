import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Input } from '../ui/input'

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="container padded mx-auto">
        <div className="py-8 md:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative size-8">
                  <img
                    src="/logo.png"
                    alt="TibaPoint Logo"
                    className="object-contain rounded-md"
                  />
                </div>
                <span className="text-lg font-semibold">TibaPoint</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your trusted healthcare companion. Connecting patients with verified doctors across Kenya.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="size-4 text-red-500" />
                <span>Made with care for Kenya</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/doctors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div> 

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get health tips and updates directly to your inbox.
              </p>
              <div className="flex flex-col lg:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border-primary/50 "
                />
                <Button className="bg-gradient-primary">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-border" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TibaPoint. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link href="https://facebook.com" aria-label="Facebook">
                <Facebook className="size-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://twitter.com" aria-label="Twitter">
                <Twitter className="size-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://instagram.com" aria-label="Instagram">
                <Instagram className="size-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn">
                <Linkedin className="size-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>

            {/* App Badges */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="text-xs">
                Google Play
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                App Store
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
