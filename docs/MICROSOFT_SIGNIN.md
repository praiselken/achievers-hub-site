# Turning on Microsoft sign-in

Written 12 September 2026. Expands the Microsoft bullet in `HANDOFF.md` §2 and
`docs/SUPABASE_MIGRATION.md` §6.

The Microsoft button already exists in the app (`src/components/auth/OAuthButtons.tsx`).
It currently fails, because the provider is switched off in Supabase. Switching it
on needs a free app registration in Microsoft Entra. This is the whole job —
about twenty minutes, no payment, no new mailbox.

---

## 1. The email question

**No new email address is needed. A Gmail address is fine.**

Microsoft lets you create a Microsoft account on any email address you already
own, including Gmail. It does not have to be an `@outlook.com` or a company
domain.

Use **`theachievershubuk@gmail.com`** — the same account that already holds the
Google Cloud project for Google sign-in (`HANDOFF.md` §2). One client-owned
identity holding every third-party account is worth more than tidiness: it is
what makes the platform handoverable without the developer in the loop.

If that address has never been used with Microsoft before, the first sign-in at
<https://entra.microsoft.com> will offer to create a Microsoft account for it.
Accept. That is the account creation — there is no separate step.

> **Not the same question:** if what is actually wanted is Microsoft 365 mailboxes
> so the business has `@theachievershub.co.uk` email instead of Gmail, that is a
> different, paid product and a separate decision. It is not needed for sign-in
> and nothing here depends on it. Settle which one is being asked before spending
> money.

---

## 2. What this costs

Nothing. Entra app registrations are free and do not require a paid Azure
subscription.

Microsoft's signup may still ask for card details to verify identity. That is
verification, not a charge — but it is exactly the point where someone assumes
they have hit a paywall and stops. Warn the client in advance.

Per the standing arrangement, this account is registered to the client, not the
developer.

---

## 3. Register the application

At <https://entra.microsoft.com>, signed in as `theachievershubuk@gmail.com`:

**Identity → Applications → App registrations → New registration.**

| Field | Value |
|---|---|
| Name | `Achievers Hub` — users see this on the consent screen, so spell it properly |
| Supported account types | **Accounts in any organisational directory and personal Microsoft accounts** |
| Redirect URI | Platform **Web**, value below |

```
https://fkpjoubmmxajbeibrodq.supabase.co/auth/v1/callback
```

**Supported account types is the one that is easy to get wrong and painful to
diagnose.** The narrow options restrict sign-in to a single organisation. Students
arrive with a mix of school Microsoft accounts and personal ones, and picking a
narrow option locks out whichever group was not anticipated — while working
perfectly for whoever tests it. Choose the broadest option.

Microsoft moves these pages and renames the labels fairly often. The shape stays
the same: register an app, allow both account types, give it that callback URL.

---

## 4. Take the two values Supabase needs

**Application (client) ID** — on the app's Overview page. Not secret, copy it.

**A client secret** — under **Certificates & secrets → Client secrets → New
client secret**. Set the description to something meaningful (`Supabase auth`)
and choose an expiry.

Two traps here:

- **Copy the Value, not the Secret ID.** They sit next to each other and only
  the Value works. The Value is shown **once** — navigate away and it is
  unrecoverable, and you simply make a new one.
- **Write down the expiry date.** Microsoft caps these at 24 months. When one
  lapses, Microsoft sign-in stops working with no warning, no email, and an error
  that reads like an application bug. Put the date in the client's calendar with
  a month's notice, not just in a document.

---

## 5. Switch it on in Supabase

**Authentication → Sign In / Providers → Azure** on project
`fkpjoubmmxajbeibrodq`. Supabase labels this provider *Azure*; it is Microsoft.

| Supabase field | What to paste |
|---|---|
| Application (client) ID | the client ID from step 4 |
| Secret Value | the secret **Value** from step 4 |
| Azure Tenant URL | leave blank — blank means `common`, which is what allows both personal and work accounts |

Enable the provider and save.

Filling the tenant field with a specific tenant ID silently undoes the broad
account types chosen in step 3. Leave it empty unless there is a reason not to.

---

## 6. Check it actually works

The app asks Microsoft for the `email` scope explicitly
(`OAuthButtons.tsx`) because Microsoft does not always return an email address
otherwise, and the profile row cannot be created without one.

1. Load the live site, click **Continue with Microsoft**.
2. Sign in with a Microsoft account that is **not** `theachievershubuk@gmail.com`
   — ideally a personal one, to prove the broad account type took effect.
3. You land back on the live site signed in, not on `localhost`.
4. A row appears in **Authentication → Users** with the email address populated.
5. A matching row appears in `profiles`.

Step 4 is the one to look at hardest. An account created with a blank email is
the characteristic Microsoft failure, and it will not surface until something
later tries to email that student.

### What can go wrong

| Symptom | Cause |
|---|---|
| Microsoft error about a mismatched redirect URI | The callback in step 3 is wrong or was saved under the wrong platform type — it must be **Web** |
| Sign-in works for you, fails for a student with a school account | Supported account types too narrow, or a tenant ID was put in the Supabase field |
| Supabase error about exchanging a code | The Secret ID was pasted instead of the Secret Value, or the secret has expired |
| Lands on `localhost:3000` after signing in | Authentication → URL Configuration was never saved — unrelated to Microsoft, see `HANDOFF.md` §2 |
| User created with no email address | The `email` scope was not honoured; check the app registration's Microsoft Graph `User.Read` permission is present |

---

## 7. Afterwards

- Record the secret expiry date in `HANDOFF.md` §2, replacing the note that
  Microsoft is off.
- The consent screen will say the app name from step 3. Google's equivalent
  currently shows the raw Supabase hostname instead, which is the parked decision
  in `HANDOFF.md` §7 — if that gets resolved with a custom domain, Microsoft
  should be revisited at the same time so both read the same.
- Apple remains off and needs the $99/year Apple Developer Program. It is
  optional for a website and it is the client's call.
