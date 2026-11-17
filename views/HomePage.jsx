"use client";

import { HeroSection } from '../sections/home/Herosection'
import { FeaturesSection } from '../sections/home/FeaturesSection'
import { FeaturedCollection } from '../sections/home/FeaturedCollection'
import { BrandStorySection } from '../sections/home/BrandStorySection'
import { NewsletterSection } from '../sections/home/NewsletterSection'

export const HomePage = ({ featured }) => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedCollection featured={featured} />
      <BrandStorySection />
      <NewsletterSection />
    </>
  )
}
