"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from "@/components/general/Footer";
import Navbar from "@/components/general/Navbar";

export default function MainLayout({ children }) {

  return (
 <div> 
<Navbar />
     
      <main className="text-[#100C08] dark:text-[#f0f8ff] ">
          {children}
      </main>
      <Footer/>
    </div>
  );
}

