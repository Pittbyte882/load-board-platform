"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu as MenuIcon, X as XIcon, ChevronDown, Phone as PhoneIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/boxaloo-logo.png"
                alt="BOXALOO - Box Truck & Cargo Van Loads"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Carriers Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                  Carriers <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <a href="https://boxaloo.com/box-truck-loads-for-owner-operators/" className="w-full">
                      Box Trucks
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/cargo-van-sprinter-loads/" className="w-full">
                      Cargo Van & Sprinter Loads
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="https://www.boxaloo.com/boxaloo-for-brokers/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Brokers
              </Link>
              
              <Link
                href="/dispatchers"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dispatchers
              </Link>
              
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>

              {/* Support Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                  Support <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/about-us/" className="w-full">
                      About Us
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/faq/" className="w-full">
                      FAQ
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/faq/#" className="w-full">
                      Help Center
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/factoring-partners/" className="w-full">
                      Factor Your Loads
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/factoring-partners/#" className="w-full">
                      Fuel Card Info
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://quote.boxaloo.com/contact515/form/CommercialAutoInsuranceQuote/formperma/m2oj4l2B3-C4DyP9pRdxZc-5YYCdDdEcm-nqxHCNyrE" className="w-full">
                      Insurance Quote
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://www.boxaloo.com/blog/" className="w-full">
                      Our Blog
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <a
                href="https://www.boxaloo.com/contact-2/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Phone Number */}
              <a 
                href="tel:8777025525" 
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                <PhoneIcon className="h-4 w-4 mr-1" />
                (877) 702-5525
              </a>

              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {/* Carriers Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carriers</p>
              <a
                href="https://www.boxaloo.com/box-truck-loads-for-owner-operators/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Box Trucks
              </a>
              <a
                href="https://www.boxaloo.com/cargo-van-sprinter-loads/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Cargo Van & Sprinter Loads
              </a>
            </div>

            <Link
              href="/brokers"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Brokers
            </Link>
            
            <Link
              href="/dispatchers"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dispatchers
            </Link>
            
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Pricing
            </Link>

            {/* Support Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</p>
              <a
                href="https://www.boxaloo.com/about-us/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                About Us
              </a>
              <a
                href="https://www.boxaloo.com/faq/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                FAQ
              </a>
              <a
                href="https://www.boxaloo.com/faq/#"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Help Center
              </a>
              <a
                href="https://www.boxaloo.com/factoring-partners/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Factor Your Loads
              </a>
              <Link
                href="/fuel-card-info"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Fuel Card Info
              </Link>
              <a
                href="https://quote.boxaloo.com/contact515/form/CommercialAutoInsuranceQuote/formperma/m2oj4l2B3-C4DyP9pRdxZc-5YYCdDdEcm-nqxHCNyrE"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Insurance Quote
              </a>
              <a
                href="https://www.boxaloo.com/blog/"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Our Blog
              </a>
            </div>

            <a
              href="https://www.boxaloo.com/contact-2/"
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact
            </a>

            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-3 px-3">
                {/* Phone Number */}
                <a 
                  href="tel:8777025525" 
                  className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  (877) 702-5525
                </a>

                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                
                <Link href="/signup">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}