/**
 * Google Apps Script to send Form Responses to Supabase 'applications' table.
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Form.
 * 2. Click the 3 dots (top right) -> Script Editor.
 * 3. Paste this code.
 * 4. Update the CONFIG object below with your Supabase details.
 * 5. Save and Run 'setupTrigger' function once to enable the submission trigger.
 */

const CONFIG = {
    SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
    SUPABASE_KEY: 'YOUR_SUPABASE_ANON_KEY', // Use ANON key.
    TABLE_NAME: 'applications'
};

function setupTrigger() {
    const form = FormApp.getActiveForm();
    ScriptApp.newTrigger('onFormSubmit')
        .forForm(form)
        .onFormSubmit()
        .create();
}

function onFormSubmit(e) {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();

    // Initialize payload with defaults
    const payload = {
        application_no: "APP-" + new Date().getTime(), // Generate a unique ID
        status: "submitted",
        created_at: new Date().toISOString(),
        // Default values if needed
        price: 0,
        operator_price: 0
    };

    // Map Form Questions to Database Columns
    // basic logic: Check the Question Title and map to DB column
    for (var i = 0; i < itemResponses.length; i++) {
        const itemResponse = itemResponses[i];
        const title = itemResponse.getItem().getTitle().toLowerCase();
        const answer = itemResponse.getResponse();

        if (title.includes("name") && !title.includes("service")) {
            payload.applicant_name = answer;
        } else if (title.includes("mobile") || title.includes("phone")) {
            payload.mobile = answer;
        } else if (title.includes("service name")) {
            payload.service_name = answer;
        } else if (title.includes("document") || title.includes("url")) {
            payload.document_url = answer;
        } else if (title.includes("user id")) {
            payload.user_id = answer === "" ? null : answer;
        } else if (title.includes("service id")) {
            payload.service_id = answer === "" ? null : answer;
        }
    }

    // Fallback: If service_name is missing, maybe hardcode it or get from form title
    if (!payload.service_name) {
        payload.service_name = FormApp.getActiveForm().getTitle();
    }

    // Send to Supabase
    sendToSupabase(payload);
}

function sendToSupabase(payload) {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLE_NAME}`;

    const options = {
        method: 'post',
        headers: {
            'apikey': CONFIG.SUPABASE_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        payload: JSON.stringify(payload)
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        Logger.log("Supabase Response: " + response.getContentText());
    } catch (error) {
        Logger.log("Error sending to Supabase: " + error);
    }
}
