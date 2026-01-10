"use client"

import { Phone, Clock, MapPin, Shield, CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  const shopInfo = {
    name: "MPOnline Authorized Service Center",
    description:
      "We are an authorized MPOnline service center providing government services, certificate applications, job registrations, and utility bill payments. Our experienced staff ensures quick and secure processing of all your applications.",
    phone: "+91 98765 43210",
    whatsapp: "+919876543210",
    address: "Shop No. 123, Main Market Road, Bhopal, Madhya Pradesh - 462001",
    email: "support@mponline-center.in",
    workingHours: [
      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
      { day: "Saturday", hours: "9:00 AM - 2:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.991!2d77.4126!3d23.2599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDE1JzM1LjYiTiA3N8KwMjQnNDUuNCJF!5e0!3m2!1sen!2sin!4v1234567890",
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground text-balance mb-2">Contact Us</h1>
          <p className="text-primary-foreground/90 text-lg">Get in touch with our authorized service center</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">{shopInfo.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{shopInfo.description}</p>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone Number</p>
                    <a
                      href={`tel:${shopInfo.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {shopInfo.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">WhatsApp</p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary"
                    >
                      <a
                        href={`https://wa.me/${shopInfo.whatsapp}?text=Hello, I would like to inquire about MPOnline services.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground">{shopInfo.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Location</h3>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <iframe
                    src={shopInfo.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Service Center Location"
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Working Hours */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Working Hours</h3>
                </div>
                <div className="space-y-3">
                  {shopInfo.workingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-start gap-2">
                      <span className="font-medium text-foreground">{schedule.day}</span>
                      <span className="text-muted-foreground text-right">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Trust & Security</h3>
                </div>
                <div className="space-y-4">
                  {/* Verified Badge */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Verified MPOnline Center</p>
                      <p className="text-sm text-muted-foreground mt-1">Officially authorized service provider</p>
                    </div>
                  </div>

                  {/* Secure Badge */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <Shield className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Secure Service</p>
                      <p className="text-sm text-muted-foreground mt-1">Your data is safe and encrypted</p>
                    </div>
                  </div>

                  {/* Experience Badge */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-accent border border-border">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">10+ Years Experience</p>
                      <p className="text-sm text-muted-foreground mt-1">Trusted by thousands of customers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
