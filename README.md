# Apex Elite Football Club Academy: website + back end

Folder contents
- `public/index.html` – the public website (home, training days, news, gallery, register, pay, contact)
- `public/admin.html` – the secret admin back end. It is not linked from the website. Open it by typing `your-site-link/admin.html`
- `netlify/functions/api.mjs` – the back end. It stores players, payments, news, photos and settings so everyone sees the same data
- `public/hero.jpg` (team photo) and `public/logo.jpg` (badge)

## Admin login
Open `/admin.html` and enter the code **APEX2026**. Change it straight away in Admin > Security.
For a code nobody can see in the project files, set an environment variable `ADMIN_CODE` in Netlify (Site configuration > Environment variables) before you first log in. A code changed inside admin overrides it.

## What admin can edit
- **Players:** recruit (Trial, Recruited, Not selected), remove, export CSV
- **Payments:** confirm payments (this changes the parent's receipt status)
- **News:** post and remove updates
- **Gallery:** add many photos at once, remove photos
- **Schedule & fees:** training days and times, fee names and amounts
- **Account & contact:** bank name, account number, account name, WhatsApp number, phone, address. Bank details appear on the payment section automatically
- **Website:** sentence under the team photo, and the team photo itself
- **Security:** change the admin code

## Put it online (Netlify, needed for the back end)
Drag and drop does not run the back end. Use Git:
1. Create a GitHub repository and upload all files in this folder, keeping the same folder structure.
2. In Netlify choose Add new site > Import an existing project > GitHub, pick the repository.
3. Leave the build command empty. Netlify reads `netlify.toml` and will publish `public` and install the back end.
4. After the first deploy, open `your-link/admin.html`, log in, and fill in Account & contact.

If you prefer the command line: `npm i -g netlify-cli`, then `netlify deploy --prod` inside this folder.

## Good to know
- Parents do not see a list of players. They enter the Player ID they received after registering when they pay.
- Card payments are not included yet. Payments are bank transfer or cash and you confirm them in admin. Paystack or Flutterwave can be added later.
- The admin code is checked on the server, but there is no lock-out after wrong tries. Use a long code.
- Names, phone numbers and player ages of children are stored. Keep the admin code private.
