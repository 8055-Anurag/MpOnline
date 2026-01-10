import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, Target, ShieldCheck, Phone, Mail, MapPin } from "lucide-react"

export default function AboutPage() {
    const stats = [
        { label: "Years Experience", value: "10+" },
        { label: "Satisfied Clients", value: "50,000+" },
        { label: "Services Provided", value: "100+" },
        { label: "Success Rate", value: "99%" },
    ]

    const values = [
        {
            title: "Reliability",
            description: "We ensure all your government applications are processed accurately and on time.",
            icon: ShieldCheck,
        },
        {
            title: "Efficiency",
            description: "Save hours of waiting in lines. We handle the bureaucracy so you don't have to.",
            icon: Target,
        },
        {
            title: "Accessibility",
            description: "Our services are available to everyone, with support in multiple languages.",
            icon: Users,
        },
        {
            title: "Integrity",
            description: "Your data and privacy are our top priority. We maintain absolute transparency.",
            icon: CheckCircle2,
        },
    ]

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-primary/5">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Empowering Citizens with <span className="text-primary">Seamless Digital Services</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            MPOnline Service Center is dedicated to bridging the gap between government services and citizens through technology and personalized support.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-card border-y">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Our mission is to simplify government-to-citizen (G2C) interactions. We believe that accessing essential services should be easy, transparent, and accessible to every citizen, regardless of their technical background.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Founded in 2015, we have grown from a small kiosk to one of the most trusted MPOnline Service Centers in the region, serving thousands of individuals and businesses every year.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {values.map((value) => (
                                <Card key={value.title} className="border-none shadow-sm bg-muted/30">
                                    <CardContent className="p-6 flex gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <value.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{value.title}</h3>
                                            <p className="text-muted-foreground">{value.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Banner */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="rounded-2xl bg-primary p-8 md:p-12 text-primary-foreground">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Visit Our Center</h2>
                                <p className="text-primary-foreground/80 mb-8 text-lg">
                                    Need personalized assistance? Stop by our center and our team will be happy to help you with any government service.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5" />
                                        <span>123 Civil Lines, Near Main Square, Bhopal, MP 462001</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5" />
                                        <span>+91 98765 43210</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5" />
                                        <span>info@mponline-services.com</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="aspect-video rounded-xl bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20">
                                    <span className="text-primary-foreground/60 italic font-medium">Map View Placeholder</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
