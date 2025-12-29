# Setup Guide

1.  **Install Dependencies** (If not already done):
    ```bash
    npm install
    ```

2.  **Supabase Setup**:
    -   Create a new project at [Supabase](https://supabase.com/).
    -   Go to **SQL Editor** and paste the content of `supabase_setup.sql` to create tables.
    -   Go to **Project Settings > API**.
    -   Copy `Project URL` and `anon public` key.

3.  **Environment Variables**:
    -   Create a file named `.env.local` in this folder.
    -   Add the following lines:
        ```
        NEXT_PUBLIC_SUPABASE_URL=your_project_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
        ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

5.  **Deploy**:
    -   Push to GitHub.
    -   Import to Vercel.
    -   Add the Environment Variables in Vercel settings.
