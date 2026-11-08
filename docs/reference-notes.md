# LifeLink — Reference Inspection Notes

Inspected 2026-11-08. Sources: `reference/` (14 screenshots) and
`Downloads/application-f783f008-…(1).apk`.

## 1. APK findings

| Item | Value |
|---|---|
| Framework | Expo SDK **51.0.0**, React Native, Hermes bytecode v96 (`assets/index.android.bundle`, 2.1 MB) |
| Package | `com.blooddonation.app`, slug `blood-donation-app`, version 1.0.0, portrait, light UI |
| Brand color | `#C41E3A` (splash + adaptive-icon background) |
| Icon / splash | Expo default placeholder (white ring on `#C41E3A`), no custom logo |
| Navigation | React Navigation (bottom tabs + native stack), not Expo Router |
| Icons | `@expo/vector-icons` (Ionicons / MaterialCommunityIcons / Feather) |
| Animation | react-native-reanimated, react-native-gesture-handler |

**The APK does not match the screenshots.** Its bundle is an earlier build
branded **"BloodConnect"** ("About BloodConnect", "BloodConnect v1.0.0 · Final Year
Project 2026", Admin Panel, donor chat). None of the screenshot strings exist in it
("LifeLink", "Partner Hospitals", "Requests Near You", "Post Emergency Request",
"Community Hero", "Critically low", "Semi-Gov", "Resting"/"Busy"). Its mock data also
differs ("Bilal Hassan", not "Bilal Hussain").

**Decision:** the screenshots are the source of truth for every screen they show.
The APK is used only for screens with no screenshot: create request, notifications,
AI assistant, about, forgot password. Branding stays **LifeLink**.

### Useful content recovered from the APK bundle
- **Create request fields:** Patient/Full Name, Blood Group Required ("— Select your blood type"),
  Units Required ("Enter a valid number (1–10)"), Urgency Level (Critical / High / Normal-Low:
  "Life-threatening emergency", "Needed within 24 hours", "Needed within hours", "Can wait a few days"),
  Hospital Name ("e.g. Services Hospital"), Hospital Address ("e.g. Jail Road, Lahore"), Phone Number,
  Additional Notes (Optional) ("Any specific requirements or information...").
  Validation: "Hospital name is required", "Hospital address is required", "Phone number is required".
  Success: "Request Posted!" / "Your blood request is now live. Nearby donors will be notified."
- **Auth:** "Welcome Back", "Sign in to continue saving lives", "Email is required", "Enter a valid email",
  "Password is required", "Min. 6 characters", "Use Demo Account", "Forgot Password?", "Login Failed".
- **Accept flow:** "Accept & Donate", "Are you sure you want to accept this request and donate…",
  "You have accepted this request. Please proceed to the hospital.", "Confirm Donation", "Donation Completed".
- **Notifications:** "Urgent: AB- Blood Needed" / "AB- blood needed at Shaukat Khanum — 7.1 km away.",
  "New Blood Request Near You" / "O+ blood needed urgently at Services Hospital, Lahore — 1.2 km away.",
  "Your Request Was Accepted" / "Ahmed Khan has accepted your blood request for A+ at Jinnah Hospital.",
  "Donation Completed" / "Your donation at Mayo Hospital has been marked as completed. Thank you!",
  "Badge Earned: Hero Donor", "Read all", "Clear All", "Delete all notifications?",
  "No Notifications" / "You're all caught up! Check back later for updates."
- **AI assistant:** greeting "Hi! I'm … AI Assistant 🩺 / I can help you with questions about blood donation…",
  suggested questions: "How can I donate blood?", "How often can I donate blood?",
  "Which blood type is universal donor?", "Who can receive O+ blood?", "How do I create a blood request?";
  canned answers about eligibility (17+ yrs, 50 kg+), 56-day interval, O-/AB+ universal, O+ recipients,
  pre-donation diet; fallback "That's a great question! … consult with a healthcare professional…".
  Input placeholder "Ask about blood donation...".
- **Donation guidelines:** "Bring a valid ID to the hospital", "Drink plenty of water (500ml+) beforehand",
  "Eat a healthy meal before donating", "Wear comfortable, loose-fitting clothing", "Rest for 15 minutes after donation".
- **Settings:** Notification Settings, Search Radius, Privacy & Security, Help & Support, Terms of Service, Privacy Policy.
- Bundle palette (Chakra-style): `#1A202C #2D3748 #4A5568 #718096 #A0AEC0 #CBD5E0 #E2E8F0 #EDF2F7 #F7FAFC`,
  red `#E53E3E #FFF5F5 #FEB2B2`, green `#38A169 #68D391 #F0FFF4`, blue `#3182CE #EBF8FF #93C5FD`,
  purple `#805AD5 #FAF5FF`, amber `#D69E2E #DD6B20 #FEF3C7 #FFFBEB #92400E #744210`.

## 2. Screenshot inventory (reference/)

| File (8.36.xx PM) | Screen |
|---|---|
| 30 PM | Onboarding slide 2: Connect with Donors Nearby (blue) |
| 30 PM (1) | Onboarding slide 1: Donate Blood, Save Lives (red) |
| 31 PM | Onboarding slide 3: Partner Hospitals (green, "Get Started ✓", no Skip) |
| 31 PM (1) | Login: red gradient hero, LifeLink, white sheet |
| 32 PM | Home top: greeting, blood-type card, stat tiles, Donation History |
| 33 PM | Home middle: history timeline, Post Emergency Request, quick actions |
| 33 PM (1) | Home bottom: Requests Near You, Recent Activity |
| 33 PM (2) | Find Donors |
| 34 PM | Blood Requests |
| 34 PM (1) | Partner Hospitals |
| 35 PM | Profile top: hero card, Ready to Save a Life, Availability Status |
| 36 PM | Profile: Personal Details |
| 36 PM (1) | Profile: Badges Earned, Recent Donations |
| 37 PM | Profile: Account menu, Sign Out |

## 3. Design tokens (measured from screenshots at 720 px ≈ 2× dp)

- **Primary red** `#C41E3A`; gradient `#D7263D → #8B1028` (diagonal TL→BR, darker bottom-right).
  Login hero uses the same gradient with faint concentric circle outlines (white ~10%).
- **Onboarding accent per slide:** red `#C41E3A` (bg `#FFF1F2→#FECDD3`), blue `#3B82F6` (bg `#EFF6FF→#DBEAFE`),
  green `#10B981` (bg `#ECFDF5→#D1FAE5`). Large rounded illustration panel (radius ~28),
  120 dp rounded-square icon tile (radius ~36), two faint white dots.
  Indicator: active pill 24×8, inactive dot 8×8 `#E5E7EB`. CTA: full-width, radius 20, height 56, accent color, text "Continue →" / "Get Started ✓". "Skip" top-right `#94A3B8`.
- **Text:** title `#0F172A`/`#111827` (bold 800), body `#475569`, muted `#94A3B8`.
- **Background** `#F5F6FA`; cards white, radius ~20–24, 1 px border `#EEF0F4`, soft shadow.
- **Green** `#10B981` / text `#059669`, bg `#ECFDF5`, border `#A7F3D0`.
- **Blue** `#2563EB` text on `#EFF6FF`. **Amber** `#F59E0B` on `#FFFBEB`. **Purple** `#7C3AED` on `#F5F3FF`.
- **Urgent orange** `#F97316`/`#EA580C`; **critical red** `#EF4444`.
- **Blood-group badge colors:** O+ red (`#C41E3A` on `#FFF1F2`, border `#FECDD3`), O- amber/brown (`#92400E` on `#FFFBEB`, border `#FDE68A`),
  B+ blue (`#1D4ED8` on `#EFF6FF`, border `#BFDBFE`), AB+ purple (`#6D28D9` on `#F5F3FF`, border `#DDD6FE`).
  Choose matching tints for A±, B-, AB-.
- **Chips:** pill height ~34 dp, white with `#E5E7EB` border, text `#94A3B8`; active = solid red, white text.
  Sort chips: soft grey `#F1F5F9`; active = `#FFF1F2` bg with red text.
- **Bottom tab bar:** white, top border; 5 tabs (Home, Donors, Requests, Hospitals, Profile); active red `#C41E3A`, inactive `#94A3B8`;
  center Requests = 50 dp red circle with white drop raised ~20 dp above the bar, label below it in red;
  Profile tab has a red unread badge (6).
- **Typography:** system Roboto; headings 800 weight. Page titles ~26 sp, card titles ~17 sp, body 14–15 sp.

## 4. Screen content (from screenshots)

**Home:** avatar "UA" (pink circle `#FCE7F3`, red ring), "Good afternoon" (time-based), "Umer 👋", bell button with red count badge.
Blood card: "YOUR BLOOD TYPE", "O+", "✓ Verified" pill, "📍 DHA Phase 6, Karachi", drop circle + "7 Donations",
"Available to Donate" row with green dot + Switch. Tiles: red gradient "7 My Donations"; green "4 Accepted"; blue "8 Requests".
Donation History card (pulse icon, "View All"): green "You are eligible to donate right now" banner, timeline
15 Aug 2024 Aga Khan University Hospital / 10 May 2024 Liaquat National Hospital / 20 Feb 2024 South City Hospital, each "1 unit" + "O+".
"Post Emergency Request — Notify all donors in your area instantly" (red gradient, ⚡, chevron).
Quick actions: Find Donors (blue), Hospitals (green), Alerts (amber), AI Help (purple).
"Requests Near You" + "3 urgent" pill + See All: Ayesha Sidd… B+ Liaquat National 1.8 km 2 units; Raza Ul Haq O+ Aga Khan 2.5 km 3 units;
Ali Raza Naqvi O- Civil Hospital 3.7 km 4 units, each "● URGENT" + red "Help" button.
"Recent Activity" + See All: "Donor Accepted Your Request — Muhammad Ali (O+) has accepted…", "New Message from Bilal Ch… — I'm on my way to the hospital…",
"Urgent Blood Request Near… — O+ blood urgently needed at A…", relative time + unread red dot.

**Find Donors:** "Find Donors", "8 donors found", red "📍 Nearby" button, search "Search by name, city, area...",
blood chips All/A+/A-/B+/B-/AB+/AB-/O+/O-, Sort: Distance / Donations / Rating / ○ Available (toggle).
Card: initials avatar (teal/cyan tints), name + blue verified check, 📍 area, "● Available", blood badge; stats row
Donations / Rating / Away / Hours (e.g. 15 · 4.9 · 0.8 km · 8 AM – 10 PM).
Donors: Bilal Hussain O- Clifton Block 4 Karachi; Ahmed Raza O+ DHA Phase 5 Karachi; Zainab Farooq AB+ North Nazimabad Karachi.

**Blood Requests:** "Blood Requests", "! 3 urgent" pill, list-icon button (pink) + red "+" button. Status chips All / Urgent (3) / Active / Fulfilled;
blood chips. Card with colored left border: "! CRITICAL" (red) / "! URGENT" (orange) tag, "718d ago", patient name, 📍 hospital, area, blood badge + "3 units",
description (2 lines), 📞 contact, "👥 2 responded" green pill, "● Urgent".
Raza Ul Haq O+ Aga Khan, Saddar Karachi, Dr. Imran Malik, ICU after road accident; Ali Raza Naqvi O- Civil Hospital, Lyari Karachi, Naqvi Family.

**Partner Hospitals:** "Partner Hospitals", "8 hospitals found", search "Search hospitals...", city chips All/Karachi/Lahore/Islamabad/R(awalpindi)…,
type chips All/Private/Public/Semi-Gov/○ Blood Bank. Card: pink building icon tile, name, blue shield verified, tags "Private" + "🩸 Blood Bank",
📍 address, ★ 4.95 (5,800), ➤ 6.5 km, 🕒 24/7, red "! Critically low: AB-" banner, inventory dots (green ok / amber low / red critical) A+ A- B+ B-.
Shaukat Khanum Memorial Cancer Hospital, 7-A Block R-3, M.A. Johar Town, Lahore; Aga Khan University Hospital, Stadium Road, Karachi 74800 (4.9, 3,420, 2.5 km).

**Profile:** header "Profile / Your donor account" + gear button. Red hero: large "UA" avatar with camera badge, "Umer Abdullah ✓", umer.abdullah@email.com,
"🩸 O+" white pill, "Donor & Recipient" pill, 📍 DHA Phase 6, Karachi, "✓ Ready to donate" green pill; stats 7 Donations · 19 Lives Saved · 4.8 Rating · 2 Badges; white edit ✎ button.
"Ready to Save a Life! — You're eligible to donate blood today" + green "Donate →".
Availability Status: Available / Resting / Busy cards + "ⓘ Nearby donors see your status when searching".
Personal Details (+ "✎ Edit"): Email, Phone +92-300-5551234, Blood Group O+, City & Area, Account Role, Last Donation Aug 15, 2024, Next Eligible Date Nov 15, 2024.
Badges Earned ("2 earned"): Regular Donor (5+ donations, Nov 1, 2023, blue shield), Community Hero (Responded to 3 urgent requests, Feb 15, 2024, green).
Recent Donations (View All). Account: Donation History, Edit Profile, Notifications (6 unread), AI Assistant, Settings, About LifeLink (Version 1.0.0). Sign Out (pink card).

## 5. Not covered by any reference
There are no screenshots for Forgot Password, Notifications, AI Assistant, Settings, About, Donation History (full), Badges, Donor detail, Hospital detail, Create Request, Edit Profile, or the Sign Out dialog.
They will be designed in the same visual language, using the APK copy listed above.
