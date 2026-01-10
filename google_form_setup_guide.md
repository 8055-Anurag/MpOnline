# Google Form Integration Guide

This guide explains how to set up your Google Form so that applications are automatically tracked in your database with the correct User ID and Service ID.

## Step 1: Create the Google Form
Create a new Google Form with the following Questions (Exact titles matter if using the default script, otherwise update the script):

1.  **Name** (Short Answer)
2.  **Mobile Number** (Short Answer)
3.  **Service Name** (Short Answer) - *Important: Better to pre-fill this so it matches your Database Service Title exactly.*
4.  **Documents Link** (Short Answer) - *Where users paste their Google Drive folder link.*
5.  **User ID** (Short Answer) - **CRITICAL for tracking.**
6.  **Service ID** (Short Answer) - **CRITICAL for tracking.**

> **Tip:** You should make the "User ID", "Service ID", and "Service Name" questions part of a separate section or just instruct users not to edit them. (Google Forms doesn't support "Hidden" fields natively, so we usually just pre-fill them).

## Step 2: Install the Script
1.  In your Google Form, click the **3 dots** (top right) -> **Script Editor**.
2.  Copy the content of `google_form_submit_script.js` from your project into the editor.
3.  Update the `CONFIG` at the top with your **Supabase URL** and **Anon Key**.
4.  Save and Run the `setupTrigger` function once. (You will need to authorize permissions).

## Step 3: Create the "Smart" Link
To automatically link applications to users, you need to use a **Pre-filled URL**.

1.  In Google Forms, click the **3 dots** -> **Get pre-filled link**.
2.  Fill in dummy data for the hidden fields:
    *   **User ID**: `{{USER_ID}}`
    *   **Service ID**: `{{SERVICE_ID}}`
    *   **Service Name**: `{{SERVICE_NAME}}`
3.  Click **Get Link** and copy it. It will look something like:
    `https://docs.google.com/forms/d/e/.../viewform?entry.123={{USER_ID}}&entry.456={{SERVICE_ID}}&entry.789={{SERVICE_NAME}}`

## Step 4: Add to Admin Panel
1.  Go to your **Admin Panel** -> **Manage User Services**.
2.  Create or Edit a Service.
3.  Paste this **Smart Link** into the **Google Form URL** field.

## Result
When a user clicks "Apply" on their dashboard:
1.  The system will replace `{{USER_ID}}` with their actual ID.
2.  The Google Form will open with their ID already filled in.
3.  When they submit, the Script sends that ID to Supabase.
4.  Supabase sees the ID and links the application to their account!
