/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // older doctor routes from the original prototype
      { source: "/dashboard/doctor/ai-diagnoses", destination: "/dashboard/doctor/ai-predictions-review", permanent: false },
      { source: "/dashboard/doctor/patient-cases", destination: "/dashboard/doctor/patient-records", permanent: false },
    ]
  },
}

export default nextConfig
