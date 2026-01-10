export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type ApplicationStatus = "submitted" | "under_review" | "approved" | "rejected" | "completed"

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    icon_name: string
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    icon_name: string
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    icon_name?: string
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            services: {
                Row: {
                    id: string
                    category_id: string
                    title: string
                    slug: string
                    description: string
                    short_description: string | null
                    price: number
                    required_documents: Json | null
                    processing_time: string | null
                    badge: string | null
                    apply_url: string
                    is_active: boolean | null
                    display_order: number | null
                    service_type: 'global' | 'user'
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    category_id: string
                    title: string
                    slug: string
                    description: string
                    short_description?: string | null
                    price?: number
                    required_documents?: Json | null
                    processing_time?: string | null
                    badge?: string | null
                    apply_url: string
                    is_active?: boolean | null
                    display_order?: number | null
                    service_type?: 'global' | 'user'
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    category_id?: string
                    title?: string
                    slug?: string
                    description?: string
                    short_description?: string | null
                    price?: number
                    required_documents?: Json | null
                    processing_time?: string | null
                    badge?: string | null
                    apply_url?: string
                    is_active?: boolean | null
                    display_order?: number | null
                    service_type?: 'global' | 'user'
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            carousel: {
                Row: {
                    id: string
                    title: string
                    subtitle: string | null
                    image_url: string
                    cta_text: string | null
                    cta_url: string | null
                    display_order: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    subtitle?: string | null
                    image_url: string
                    cta_text?: string | null
                    cta_url?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    subtitle?: string | null
                    image_url?: string
                    cta_text?: string | null
                    cta_url?: string | null
                    display_order?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            applications: {
                Row: {
                    id: string
                    application_no: string
                    user_id: string | null // Added
                    service_id: string | null // Added
                    applicant_name: string
                    mobile: string
                    service_name: string
                    status: ApplicationStatus
                    created_at: string
                    document_url: string | null
                    operator_id: string | null
                    price: number | null
                    operator_price: number | null
                    accepted_at: string | null
                }
                Insert: {
                    id?: string
                    application_no: string
                    user_id?: string | null // Added
                    service_id?: string | null // Added
                    applicant_name: string
                    mobile: string
                    service_name: string
                    status?: ApplicationStatus
                    created_at?: string
                    document_url?: string | null
                    operator_id?: string | null
                    price?: number | null
                    operator_price?: number | null
                    accepted_at?: string | null
                }
                Update: {
                    id?: string
                    application_no?: string
                    user_id?: string | null // Added
                    service_id?: string | null // Added
                    applicant_name?: string
                    mobile?: string
                    service_name?: string
                    status?: ApplicationStatus
                    created_at?: string
                    document_url?: string | null
                    operator_id?: string | null
                    price?: number | null
                    operator_price?: number | null
                    accepted_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "applications_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "applications_service_id_fkey"
                        columns: ["service_id"]
                        referencedRelation: "user_services"
                        referencedColumns: ["id"]
                    }
                ]
            }
            operators: {
                Row: {
                    id: string
                    full_name: string
                    mobile: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    mobile?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    mobile?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            operator_requests: {
                Row: {
                    id: string
                    full_name: string
                    email: string
                    mobile: string | null
                    password?: string | null // Temp storage for approval workflow
                    status: "pending" | "approved" | "rejected"
                    created_at: string
                    reviewed_at: string | null
                }
                Insert: {
                    id?: string
                    full_name: string
                    email: string
                    mobile?: string | null
                    password?: string | null
                    status?: "pending" | "approved" | "rejected"
                    created_at?: string
                    reviewed_at?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string
                    email?: string
                    mobile?: string | null
                    password?: string | null
                    status?: "pending" | "approved" | "rejected"
                    created_at?: string
                    reviewed_at?: string | null
                }
                Relationships: []
            }
            users: {
                id: string
                full_name: string
                email: string
                mobile: string | null
                role: 'user' | 'admin' | 'operator'
                is_active: boolean
                created_at: string
                Insert: {
                    id: string
                    full_name: string
                    mobile?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    mobile?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            user_services: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    required_documents: string | null
                    price: number
                    operator_price: number | null // Added
                    google_form_url: string
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    required_documents?: string | null
                    price?: number
                    operator_price?: number | null // Added
                    google_form_url: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    required_documents?: string | null
                    price?: number
                    operator_price?: number | null // Added
                    google_form_url?: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
