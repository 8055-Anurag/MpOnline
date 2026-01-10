
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { Database } from "@/types/database"

type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type CarouselInsert = Database['public']['Tables']['carousel']['Insert']

const categories = [
    {
        icon: "Briefcase",
        title: "Government Jobs",
        slug: "jobs",
        description: "Find and apply for the latest job vacancies across MP government departments",
        display_order: 1,
        icon_name: "Briefcase"
    },
    {
        icon: "FileText",
        title: "Certificates",
        slug: "certificates",
        description: "Download birth, caste, income, domicile, and other official certificates",
        display_order: 2,
        icon_name: "FileText"
    },
    {
        icon: "Building2",
        title: "Government Schemes",
        slug: "schemes",
        description: "Explore welfare schemes, subsidies, and benefits for eligible citizens",
        display_order: 3,
        icon_name: "Building2"
    },
    {
        icon: "Zap",
        title: "Utility Services",
        slug: "utilities",
        description: "Pay electricity, water bills, and access other utility services online",
        display_order: 4,
        icon_name: "Zap"
    },
]

const services = {
    jobs: [
        {
            id: "police-constable-2024",
            title: "MP Police Constable Recruitment 2024",
            description:
                "The Madhya Pradesh Professional Examination Board (MP PEB) invites applications for the post of Police Constable across various districts in Madhya Pradesh. This is an excellent opportunity to serve the state and build a rewarding career in law enforcement. Selected candidates will undergo comprehensive training at the state police academy before being assigned to their respective districts.",
            documents: [
                "10th and 12th mark sheets",
                "Valid Photo ID (Aadhaar/Voter ID/Passport)",
                "Caste Certificate (if applicable)",
                "Recent passport-size photographs (3 copies)",
                "Physical fitness certificate from authorized medical officer",
            ],
            price: 500,
            badge: "New",
            applyUrl: "https://forms.google.com/",
            processingTime: "45-60 days",
            category: "jobs",
        },
        {
            id: "teacher-recruitment-2024",
            title: "MP Teacher Recruitment 2024",
            description:
                "The Madhya Pradesh Education Department is conducting a major recruitment drive for Primary and Secondary School Teachers across government schools in the state. This is an excellent opportunity for qualified educators to contribute to the development of education in Madhya Pradesh. Selected candidates will be assigned to schools based on their preference and district requirements.",
            documents: [
                "B.Ed Certificate",
                "Degree Marksheets (B.A./B.Sc./B.Com)",
                "Teaching Experience Certificate (if applicable)",
                "Valid Photo ID (Aadhaar/Voter ID/Passport)",
                "Recent passport-size photographs (3 copies)",
            ],
            price: 600,
            badge: "New",
            applyUrl: "https://forms.google.com/",
            processingTime: "60-75 days",
            category: "jobs",
        },
        {
            id: "forest-guard-2024",
            title: "MP Forest Guard Recruitment",
            description:
                "The Madhya Pradesh Forest Department is recruiting Forest Guards for various districts. This position involves protecting forest resources, preventing illegal activities, and assisting in wildlife conservation efforts. Candidates must be physically fit and willing to work in remote forest areas.",
            documents: [
                "Educational Certificates (10th and 12th)",
                "Physical Fitness Certificate from authorized medical officer",
                "Caste Certificate (if applicable)",
                "Valid Photo ID Proof",
                "Character Certificate",
            ],
            price: 400,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "30-45 days",
            category: "jobs",
        },
        {
            id: "mppsc-state-service",
            title: "MPPSC State Service Examination",
            description:
                "The Madhya Pradesh Public Service Commission is conducting the State Service Examination for recruitment to various Group A and Group B administrative posts in the state government. This prestigious examination offers opportunities to serve in different departments including revenue, education, health, and administration.",
            documents: [
                "Graduation Certificate from recognized university",
                "Experience Certificates (if applicable)",
                "Aadhaar Card",
                "Latest passport-size photographs (5 copies)",
                "Caste Certificate (if applicable for reservation)",
            ],
            price: 1000,
            badge: "Urgent",
            applyUrl: "https://forms.google.com/",
            processingTime: "90-120 days",
            category: "jobs",
        },
    ],
    certificates: [
        {
            id: "income-certificate",
            title: "Income Certificate",
            description:
                "Apply for an official Income Certificate issued by the state government. This certificate is valid for government records and can be used for various purposes including scholarship applications, admission processes, government scheme eligibility, loan applications, and legal proceedings. The certificate is digitally signed and can be verified online.",
            documents: [
                "Aadhaar Card (original and photocopy)",
                "Salary slips/Income proof (last 6 months)",
                "Property documents (if applicable)",
                "Self-declaration affidavit on stamp paper",
                "Recent passport-size photograph",
            ],
            price: 50,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "7-10 working days",
            category: "certificates",
        },
        {
            id: "caste-certificate",
            title: "Caste Certificate",
            description:
                "Get official SC/ST/OBC caste certificate for reservation benefits in education and employment. This certificate is issued by the competent authority and is required for availing reservation benefits in government jobs, educational institutions, and various welfare schemes.",
            documents: [
                "Parents Caste Certificate",
                "Birth Certificate",
                "Aadhaar Card",
                "School Leaving Certificate",
                "Recent passport-size photograph",
            ],
            price: 50,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "10-15 working days",
            category: "certificates",
        },
        {
            id: "domicile-certificate",
            title: "Domicile Certificate",
            description:
                "Obtain your official Domicile Certificate proving your residence in Madhya Pradesh. This certificate is essential for availing state-specific benefits, education admissions, government job applications, and various welfare schemes.",
            documents: [
                "Aadhaar Card",
                "Proof of residence (Electricity bill/Ration card)",
                "School leaving certificate",
                "Birth certificate",
                "Recent passport-size photograph",
            ],
            price: 50,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "10-15 working days",
            category: "certificates",
        },
        {
            id: "birth-certificate",
            title: "Birth Certificate",
            description:
                "Register and obtain official birth certificate for newborns or delayed registrations. This certificate is a vital document required for school admissions, passport applications, and various government services.",
            documents: [
                "Hospital Discharge Card",
                "Parents ID Proof (Aadhaar Card)",
                "Address Proof",
                "Marriage Certificate of parents",
                "Affidavit for delayed registration (if applicable)",
            ],
            price: 100,
            badge: "New",
            applyUrl: "https://forms.google.com/",
            processingTime: "5-7 working days",
            category: "certificates",
        },
    ],
    schemes: [
        {
            id: "ladli-laxmi-yojana",
            title: "Ladli Laxmi Yojana",
            description:
                "The Ladli Laxmi Yojana is a flagship welfare scheme by the Government of Madhya Pradesh aimed at improving the economic and educational status of girls. Under this scheme, the government provides financial assistance for the girl child's education and marriage expenses. The scheme ensures a bright future for girls by providing financial support at various stages of their education.",
            documents: [
                "Birth certificate of the girl child",
                "Aadhaar Card of parents",
                "Income certificate",
                "Residence proof",
                "Bank account details",
                "Recent passport-size photographs of the girl child",
            ],
            price: 0,
            badge: "Popular",
            applyUrl: "https://forms.google.com/",
            processingTime: "15-20 working days",
            category: "schemes",
        },
        {
            id: "kisan-kalyan-yojana",
            title: "Mukhyamantri Kisan Kalyan Yojana",
            description:
                "This scheme provides financial assistance to farmers for agricultural development, crop enhancement, and farming equipment. The government aims to improve the income and living standards of farmers through this welfare initiative.",
            documents: [
                "Land Records (Khasra-Khatoni)",
                "Aadhaar Card",
                "Bank Passbook with account details",
                "Farmer ID Card",
                "Recent passport-size photographs",
            ],
            price: 0,
            badge: "Urgent",
            applyUrl: "https://forms.google.com/",
            processingTime: "20-30 working days",
            category: "schemes",
        },
        {
            id: "sambal-yojana",
            title: "Sambal Yojana (Unorganized Worker)",
            description:
                "Social security scheme providing benefits to unorganized sector workers and their families. This includes accident insurance, life insurance, education assistance for children, and maternity benefits.",
            documents: [
                "Age Proof (Birth Certificate/School Certificate)",
                "Income Certificate",
                "Bank Account Details",
                "Work Proof or Self-declaration",
                "Recent passport-size photographs",
            ],
            price: 0,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "15-20 working days",
            category: "schemes",
        },
        {
            id: "scholarship-portal",
            title: "MP Scholarship Portal",
            description:
                "Apply for various scholarships for SC/ST/OBC students pursuing higher education. The portal provides financial assistance to students from economically weaker sections to support their education.",
            documents: [
                "Caste Certificate",
                "Income Certificate",
                "Previous Year Marksheet",
                "College ID Card",
                "Bank Account Details",
            ],
            price: 0,
            badge: "New",
            applyUrl: "https://forms.google.com/",
            processingTime: "30-45 working days",
            category: "schemes",
        },
    ],
    utilities: [
        {
            id: "electricity-bill-payment",
            title: "Electricity Bill Payment",
            description:
                "Pay your electricity bills online through the MPOnline portal. This service allows you to conveniently pay your monthly electricity bills from the comfort of your home. You can view your bill history, download receipts, and set up payment reminders. The payment is processed instantly and confirmation is sent via SMS and email.",
            documents: [
                "Consumer number",
                "Valid email address",
                "Mobile number for OTP verification",
                "Debit/Credit card or Net Banking details",
            ],
            price: 0,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "Instant",
            category: "utilities",
        },
        {
            id: "water-bill-payment",
            title: "Water Bill Payment",
            description:
                "Clear your municipal water supply bills online without visiting offices. The service provides instant payment confirmation and digital receipts for your records.",
            documents: [
                "Consumer ID",
                "Previous Bill Copy (optional)",
                "Contact Details (Email and Mobile)",
                "Payment method details",
            ],
            price: 0,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "Instant",
            category: "utilities",
        },
        {
            id: "property-tax-payment",
            title: "Property Tax Payment",
            description:
                "Pay annual property tax to your municipal corporation online. Calculate your tax amount, view previous payment history, and get instant digital receipts.",
            documents: [
                "Property ID or Assessment Number",
                "Previous Tax Receipt",
                "Ownership Documents",
                "Contact information",
            ],
            price: 0,
            badge: null,
            applyUrl: "https://forms.google.com/",
            processingTime: "Instant",
            category: "utilities",
        },
        {
            id: "driving-license-application",
            title: "Driving License Application",
            description:
                "Apply for new driving license or renew existing license online through the transport department. Book your driving test slot and track your application status online.",
            documents: [
                "Age Proof (Birth Certificate/10th Certificate)",
                "Address Proof (Aadhaar/Voter ID/Utility Bill)",
                "Aadhaar Card",
                "Medical Certificate from authorized doctor",
                "Passport-size photographs (4 copies)",
            ],
            price: 200,
            badge: "New",
            applyUrl: "https://forms.google.com/",
            processingTime: "15-20 working days",
            category: "utilities",
        },
    ],
}


export async function GET() {
    try {
        // 1. Insert Categories
        console.log("Seeding categories...")
        const { data: categoryData, error: categoryError } = await (supabase as any)
            .from('categories')
            .upsert(
                categories.map(c => ({
                    name: c.title,
                    slug: c.slug,
                    description: c.description,
                    icon_name: c.icon_name,
                    display_order: c.display_order,
                    is_active: true
                } as CategoryInsert)),
                { onConflict: 'slug' }
            )
            .select()

        if (categoryError) {
            console.error("Error seeding categories:", categoryError)
            return NextResponse.json({ error: categoryError.message }, { status: 500 })
        }

        console.log("Categories seeded:", categoryData)

        // 2. Insert Services
        console.log("Seeding services...")
        const servicesToInsert = []

        for (const [categorySlug, categoryServices] of Object.entries(services)) {
            const category = categoryData.find((c: CategoryRow) => c.slug === categorySlug)
            if (!category) {
                console.warn(`Category not found for slug: ${categorySlug}`)
                continue
            }

            for (const service of categoryServices) {
                servicesToInsert.push({
                    category_id: category.id,
                    title: service.title,
                    slug: service.id,
                    description: service.description,
                    short_description: service.description.substring(0, 150) + "...",
                    price: service.price,
                    required_documents: service.documents,
                    processing_time: service.processingTime,
                    badge: service.badge,
                    apply_url: service.applyUrl,
                    is_active: true,
                    display_order: 0 // You can adjust this if needed
                })
            }
        }

        const { error: serviceError } = await (supabase as any)
            .from('services')
            .upsert(servicesToInsert as ServiceInsert[], { onConflict: 'slug' })

        if (serviceError) {
            console.error("Error seeding services:", serviceError)
            return NextResponse.json({ error: serviceError.message }, { status: 500 })
        }

        // 3. Insert Carousel
        const carouselItems = [
            {
                id: "d290f1ee-6c54-4b01-90e6-d701748f0851", // predefined UUIDs to allow updates/upserts
                image_url: "/indian-government-office-building-blue-sky.jpg",
                title: "Welcome to MPOnline Services",
                subtitle: "Your one-stop portal for all government services in Madhya Pradesh",
                cta_text: "Explore Services",
                cta_url: "/services",
                display_order: 1,
                is_active: true
            },
            {
                id: "d290f1ee-6c54-4b01-90e6-d701748f0852",
                image_url: "/students-using-computers-job-portal.jpg",
                title: "Find Government Jobs",
                subtitle: "Apply for the latest job vacancies and employment opportunities",
                cta_text: "View Jobs",
                cta_url: "/services/jobs",
                display_order: 2,
                is_active: true
            },
            {
                id: "d290f1ee-6c54-4b01-90e6-d701748f0853",
                image_url: "/official-certificates-documents.jpg",
                title: "Download Certificates",
                subtitle: "Access your birth, caste, income, and other certificates online",
                cta_text: "Get Certificates",
                cta_url: "/services/certificates",
                display_order: 3,
                is_active: true
            },
            {
                id: "d290f1ee-6c54-4b01-90e6-d701748f0854",
                image_url: "/government-schemes-benefits-people.jpg",
                title: "Government Schemes",
                subtitle: "Explore welfare schemes and benefits for citizens",
                cta_text: "Learn More",
                cta_url: "/services/schemes",
                display_order: 4,
                is_active: true
            },
            {
                id: "d290f1ee-6c54-4b01-90e6-d701748f0855",
                image_url: "/utility-bill-payment-online.jpg",
                title: "Pay Utility Bills",
                subtitle: "Quick and secure online payment for electricity, water, and more",
                cta_text: "Pay Now",
                cta_url: "/services/utilities",
                display_order: 5,
                is_active: true
            },
        ]

        const { error: carouselError } = await (supabase as any)
            .from('carousel')
            .upsert(carouselItems as CarouselInsert[], { onConflict: 'id' as any })

        if (carouselError) {
            console.log("Carousel error:", carouselError)
            return NextResponse.json({ error: carouselError.message }, { status: 500 })
        }


        return NextResponse.json({ message: "Seeding completed successfully" })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
