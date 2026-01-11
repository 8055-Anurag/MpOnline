"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { FileText, Download, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Document = {
    id: string
    document_url: string
    document_type: string | null
    created_at: string
}

interface ApplicationDocumentsProps {
    applicationId: string
    refreshTrigger?: number
    excludeResultDoc?: boolean
}

export function ApplicationDocuments({ applicationId, refreshTrigger = 0, excludeResultDoc = false }: ApplicationDocumentsProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDocuments = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('application_documents')
                .select('*')
                .eq('application_id', applicationId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDocuments(data || [])
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (applicationId) {
            fetchDocuments()
        }
    }, [applicationId, refreshTrigger])

    const filteredDocs = excludeResultDoc
        ? documents.filter(doc => doc.document_type !== 'result_doc')
        : documents

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (filteredDocs.length === 0) {
        return (
            <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground text-sm">
                No documents found.
            </div>
        )
    }

    const getDocTypeLabel = (type: string | null) => {
        switch (type) {
            case 'initial_doc': return 'Applicant Upload'
            case 'result_doc': return 'Processed Result'
            default: return 'Document'
        }
    }

    return (
        <div className="space-y-3">
            {filteredDocs.map((doc: Document) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">
                                {getDocTypeLabel(doc.document_type)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-8 gap-2">
                            <a href={doc.document_url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
