import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── CLEAR ────────────────────────────────────────────────────────────────────

async function clearAll() {
  // Roadmap data — delete in FK order
  const phases = await prisma.phase.findMany({ select: { id: true } });
  const phaseIds = phases.map((p) => p.id);
  await prisma.phaseNote.deleteMany({ where: { phaseId: { in: phaseIds } } });
  await prisma.task.deleteMany({ where: { phaseId: { in: phaseIds } } }); // cascades UserProgress
  await prisma.phase.deleteMany();
  await prisma.roadmapPath.deleteMany();

  await prisma.interviewQuestion.deleteMany();
  await prisma.salaryRange.deleteMany();
  await prisma.asset.deleteMany();
}

// ─── ROADMAPS ─────────────────────────────────────────────────────────────────

async function seedRoadmaps() {
  // WHV AUSTRALIA ──────────────────────────────────────────────────────────────
  await prisma.roadmapPath.create({
    data: {
      type: "WHV_AUSTRALIA",
      title: "WHV Australia (Working Holiday Visa Subclass 417)",
      phases: {
        create: [
          {
            order: 1,
            title: "Eligibility Check & Pre-Research",
            isFree: true,
            description: "Verify you qualify and understand the full WHV program before committing time and money to the application process.",
            notes: {
              create: [
                { type: "DO", content: "Indonesia has a bilateral MOU for Subclass 417 — Indonesians apply directly online via IMMI with no embassy queue required for the visa itself." },
                { type: "DONT", content: "Do not wait until you're 30 years old — the IMMI system checks your age at the date of application submission, not arrival date. Allow 4–12 weeks for processing." },
                { type: "WARNING", content: "WHV Subclass 417 for Indonesia has an annual quota allocation. Application slots typically open in January–February and fill within days. Set a reminder and apply on opening day." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Confirm you are between 18–30 years old at your planned application submission date (must be under 31)" },
                { order: 2, title: "Verify your Indonesian passport has at least 18 months of remaining validity" },
                { order: 3, title: "Read the official WHV Subclass 417 requirements at immi.homeaffairs.gov.au" },
                { order: 4, title: "Research your target Australian city's job market on seek.com.au for your professional field" },
                { order: 5, title: "Confirm you have no serious criminal convictions that would disqualify your application" },
                { order: 6, title: "Join the Indonesian WHV Facebook and Telegram communities for current firsthand experience from active WHV holders" },
              ],
            },
          },
          {
            order: 2,
            title: "Document Preparation",
            isFree: true,
            description: "Gather and authenticate all documents required for IMMI submission. Document quality is the most common cause of delays.",
            notes: {
              create: [
                { type: "DO", content: "Have your bank statement stamped by a bank teller no earlier than 1 working day before uploading to IMMI — older stamps are flagged for inconsistency." },
                { type: "DONT", content: "Do not use uncertified translators. IMMI requires sworn translations (penerjemah tersumpah bersertifikat HAKI) for all non-English documents." },
                { type: "COST", content: "SKCK: Rp30.000 (at Polda) | Sworn translation per document: Rp250.000–500.000 | OSHC basic travel insurance (12 months): AUD 300–600 | Total document budget: approx. Rp3.000.000–6.000.000." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Renew or obtain Indonesian passport with at least 18 months remaining validity" },
                { order: 2, title: "Apply for SKCK (Surat Keterangan Catatan Kepolisian) from your nearest Polda — valid for 6 months" },
                { order: 3, title: "Obtain bank statement (rekening koran) showing minimum AUD 5,000 equivalent (approx. Rp52.000.000) — stamped by a teller on day of submission" },
                { order: 4, title: "Purchase OSHC or comprehensive travel insurance with minimum AUD 500.000 medical coverage" },
                { order: 5, title: "Get birth certificate (akta kelahiran) officially translated to English by a HAKI-certified sworn translator" },
                { order: 6, title: "Prepare 4×6 cm biometric photos — white background, plain expression, taken within the last 6 months" },
                { order: 7, title: "Gather diplomas, transcripts, or professional certificates that may be relevant to your intended work in Australia" },
              ],
            },
          },
          {
            order: 3,
            title: "Visa Application via IMMI Portal",
            isFree: false,
            description: "Submit your Subclass 417 application through the official Australian IMMI portal. All steps are done online — no embassy visit required.",
            notes: {
              create: [
                { type: "DO", content: "Use the exact name spelling from your passport across all documents and the IMMI form. Any mismatch triggers a manual review and adds weeks to processing time." },
                { type: "DONT", content: "Do not plan any major personal or work commitments around a specific grant date — processing times range from 4 to 12 weeks based on health check flags." },
                { type: "COST", content: "Visa fee: AUD 650 (approx. Rp6.800.000 at current exchange rates). Strictly non-refundable regardless of outcome, including rejection." },
                { type: "WARNING", content: "If IMMI requests a health examination, you must use an IMMI-approved Panel Physician. The chest X-ray and medical check cost AUD 400–600 extra and can delay processing by 3–6 weeks." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Create your ImmiAccount at immi.homeaffairs.gov.au" },
                { order: 2, title: "Start a new application for Subclass 417 (Working Holiday) visa" },
                { order: 3, title: "Complete all form sections including full travel history, employment history, and health declarations" },
                { order: 4, title: "Upload all required documents: passport bio page, bank statement, SKCK, insurance, birth certificate translation" },
                { order: 5, title: "Pay the AUD 650 application fee by credit or debit card" },
                { order: 6, title: "Submit the application and save your Transaction Reference Number (TRN)" },
                { order: 7, title: "Complete health examination if requested (at IMMI-approved panel physician only)" },
                { order: 8, title: "Monitor your ImmiAccount inbox for the visa grant notification email" },
              ],
            },
          },
          {
            order: 4,
            title: "Pre-Departure Preparation",
            isFree: false,
            description: "Complete the SDUWHV process and set up your Australian financial and administrative infrastructure before you fly.",
            notes: {
              create: [
                { type: "DO", content: "Complete the SDUWHV (Surat Dukungan WHV) process with the Indonesian Ministry of Foreign Affairs (Kemenlu) immediately after visa grant. Bring the original SDUWHV document to Australia." },
                { type: "DONT", content: "Do not purchase flights, sign rental agreements, or resign from your current job until the visa grant notification appears in your ImmiAccount." },
                { type: "COST", content: "One-way flight Jakarta–Sydney/Melbourne: Rp6.000.000–11.000.000 depending on airline and season | Opening fund to bring minimum: AUD 5.000 | CommBank/ANZ international account: free to open online before departure." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Submit SDUWHV request letter to Kemenlu RI after visa grant — obtain the official support letter to bring with you" },
                { order: 2, title: "Apply for Australian Tax File Number (TFN) online at ato.gov.au — needed from day 1 of employment" },
                { order: 3, title: "Open an Australian bank account remotely before departure: Commonwealth Bank, ANZ, or Westpac all offer pre-arrival account opening for WHV holders" },
                { order: 4, title: "Book one-way flights after confirmed visa grant (one-way gives flexibility; return flights can be booked later)" },
                { order: 5, title: "Arrange first 1–2 weeks of accommodation: backpacker hostel, Airbnb, or pre-arranged share house in your target city" },
                { order: 6, title: "Download Seek, LinkedIn, Gumtree, and Backpacker Job Board apps on your phone before departure" },
                { order: 7, title: "Save contact details of the Indonesian Consulate-General in your state (Sydney, Melbourne, Perth, or Brisbane)" },
              ],
            },
          },
          {
            order: 5,
            title: "Arrival & Employment Setup",
            isFree: false,
            description: "Land in Australia and establish the legal, financial, and professional infrastructure to start working within your first 2 weeks.",
            notes: {
              create: [
                { type: "DO", content: "Report your arrival to the Indonesian Consulate-General in your state within 30 days of landing — this is required for all SDUWHV holders and registers you in the Indonesian diaspora system." },
                { type: "DONT", content: "Do not work without providing your TFN to your employer. Without it, the ATO will withhold 47% of your gross wages (the highest possible rate), with no refund until you file a tax return." },
                { type: "WARNING", content: "You cannot work more than 6 months with any single employer on a WHV — this is a visa condition. Violating it can lead to visa cancellation." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Report arrival to the Indonesian Consulate-General in your state (mandatory for SDUWHV holders)" },
                { order: 2, title: "Activate your Australian bank account, collect debit card, and enable mobile banking" },
                { order: 3, title: "Buy an Australian prepaid SIM card: Optus, Telstra, or Woolworths Mobile (Telstra network) — get a plan with sufficient data for job searching" },
                { order: 4, title: "Create your myGov account at my.gov.au and link your ATO and Medicare services" },
                { order: 5, title: "Update your TFN registration with your current Australian residential address via ATO online services" },
                { order: 6, title: "Create and optimize job profiles on Seek.com.au, LinkedIn (Australian network), Indeed AU, and Gumtree Jobs" },
                { order: 7, title: "Complete RSA (Responsible Service of Alcohol) certificate at a registered RTO if targeting hospitality work — costs AUD 100–150, typically done in 1 day" },
                { order: 8, title: "Complete White Card (Construction Induction) if targeting construction or site work — required by all employers, costs AUD 100–200" },
                { order: 9, title: "Apply for a local Superannuation (super) account and provide your TFN and super details to your employer on day 1 of employment" },
              ],
            },
          },
          {
            order: 6,
            title: "Regional Work & Second-Year Extension",
            isFree: false,
            description: "Complete the 88-day regional work requirement to qualify for the Subclass 417 second-year extension. This is the most strategically important phase for long-term Australia plans.",
            notes: {
              create: [
                { type: "DO", content: "Check the official Harvest Trail website (jobsearch.gov.au/harvesttrail) for legitimate regional employer listings. This is the safest way to find qualifying employers." },
                { type: "DONT", content: "Do not attempt to falsify or buy regional work certificates. IMMI actively audits employers and cross-checks TFN records. Misrepresentation results in a permanent ban from Australia." },
                { type: "COST", content: "Regional transport: AUD 200–500 bus/train to farming areas | Accommodation in regional areas: AUD 100–250/week (sometimes provided by employer and deducted from wages) | Second-year visa extension fee: AUD 650." },
                { type: "WARNING", content: "Not all rural areas qualify for the 88-day regional work count. Verify each employer's location against the IMMI Specified Work postcode list at immi.homeaffairs.gov.au before starting work." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Search Harvest Trail Australia for harvest work in your target season: tomatoes (QLD Jan–Feb), apples (VIC Mar–May), mangoes (NT Sep–Nov), grapes (SA/VIC Jan–Mar)" },
                { order: 2, title: "Confirm the employer's location is in a designated regional area under IMMI's specified postcode list" },
                { order: 3, title: "Complete minimum 88 work days (calendar days worked, not necessarily consecutive) with qualifying regional employer(s)" },
                { order: 4, title: "Collect payslips and request a Regional Certification Letter from your employer on official letterhead confirming the regional work dates" },
                { order: 5, title: "Lodge the Subclass 417 second-year extension application on IMMI before your current visa expires — pay the AUD 650 fee" },
                { order: 6, title: "For third-year extension (Subclass 417): complete 179 days of specified regional work in Northern Australia (NT, QLD, WA, SA)" },
                { order: 7, title: "Keep all payslips, employer ABNs, employment contracts, and regional certification letters filed for potential IMMI audit" },
              ],
            },
          },
          {
            order: 7,
            title: "Tax Return & Superannuation Claim",
            isFree: false,
            description: "Recover overpaid taxes and claim your superannuation balance after departure. Many WHV holders leave thousands of dollars unclaimed.",
            notes: {
              create: [
                { type: "DO", content: "Lodge your tax return even if you worked for only 1–2 months — you are likely entitled to a refund of overpaid PAYG withholding. File via myTax on ATO's website." },
                { type: "DONT", content: "Do not leave Australia without documenting every employer's full legal name, ABN, and address. You will need this information to locate super balances and file DASP." },
                { type: "COST", content: "Tax agent fee if using a registered tax agent: AUD 150–300 | DASP (Departing Australia Superannuation Payment) is taxed at 65% withholding for WHV holders — still worth claiming as balances often reach AUD 1.000–5.000+." },
                { type: "WARNING", content: "You must lodge your DASP application within 6 months of leaving Australia or your visa expiry, whichever is earlier. Late applications are rejected. Apply at ATO online services." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Collect all payslips and PAYG payment summaries (group certificates) from every employer during your stay" },
                { order: 2, title: "Lodge your Australian tax return via myTax on the ATO website (ato.gov.au) for the financial year July 1 – June 30" },
                { order: 3, title: "Search for all your superannuation fund balances using the myGov/ATO 'Find lost super' tool — you may have multiple funds from different employers" },
                { order: 4, title: "Consolidate multiple super funds into one before departure to simplify DASP process" },
                { order: 5, title: "Apply for Departing Australia Superannuation Payment (DASP) via ATO online services after leaving Australia" },
                { order: 6, title: "Allow 3–6 months for DASP processing — funds are paid to your nominated overseas bank account (deducted at 65% WHV withholding tax rate)" },
              ],
            },
          },
        ],
      },
    },
  });

  // AUSBILDUNG GERMANY ──────────────────────────────────────────────────────────
  await prisma.roadmapPath.create({
    data: {
      type: "AUSBILDUNG_GERMANY",
      title: "Ausbildung Germany (Vocational Training Visa)",
      phases: {
        create: [
          {
            order: 1,
            title: "German Language Learning — A1 to B2",
            isFree: true,
            description: "German language proficiency is the single most important factor in your Ausbildung application. B2 is the minimum standard; C1 is required for nursing and healthcare programs.",
            notes: {
              create: [
                { type: "DO", content: "Register specifically for the Goethe-Institut exam — many Ausbildung employers explicitly require 'Goethe-Zertifikat B2', not just any B2 certificate. Telc B2 is also widely accepted." },
                { type: "DONT", content: "Do not skip levels or only study online without structured classroom assessment. Companies conduct language verification during interviews — inconsistent proficiency gets noticed." },
                { type: "COST", content: "Goethe-Institut B1 group course (Jakarta): Rp5.500.000–8.000.000 | B2 exam registration: Rp3.500.000 | Realistic total budget from zero to B2 certificate: Rp20.000.000–35.000.000 over 18–24 months." },
                { type: "WARNING", content: "B2 from scratch realistically takes 18–24 months of consistent study (5–10 hours per week). Start immediately — language preparation is the longest phase in this entire process." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Enroll in a formal A1 course at Goethe-Institut Indonesia (Jakarta/Surabaya/Bandung/Yogyakarta) or a certified partner institution" },
                { order: 2, title: "Complete A1 level and obtain the official certificate (approximately 3–4 months of study)" },
                { order: 3, title: "Complete A2 level and certificate (approximately 3–4 months)" },
                { order: 4, title: "Complete B1 level and obtain the Goethe-Institut B1 certificate — minimum for daily life communication in Germany" },
                { order: 5, title: "Complete B2 course and register for the official Goethe-Institut or telc B2 examination" },
                { order: 6, title: "Pass and obtain your official B2 certificate — this document is required for both the company application and the visa" },
                { order: 7, title: "Continue practicing German daily via platforms such as Deutsche Welle (DW Learn German), Lingoda, or conversation exchange partners" },
              ],
            },
          },
          {
            order: 2,
            title: "Career Field (Berufsfeld) Research & Direction",
            isFree: true,
            description: "Choose your Ausbildung career field strategically — based on demand, your qualifications, and realistic placement prospects for international applicants.",
            notes: {
              create: [
                { type: "DO", content: "Use the official 'Make it in Germany' portal (make-it-in-germany.com) — the German government's official resource for international applicants with an Ausbildung job finder and visa eligibility checker." },
                { type: "DONT", content: "Do not pay any agency or individual to 'place' you in an Ausbildung program. By German law, employers pay zero placement fees — any agency charging you is operating illegally." },
                { type: "WARNING", content: "Nursing Ausbildung (Pflegefachmann/-frau) is a separate 3-year program with specific language and competency requirements. Research this field separately — the process differs significantly from IT or business Ausbildung." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Explore the top Ausbildung fields for international applicants: IT (Fachinformatiker Anwendungsentwicklung or Systemintegration), nursing (Pflegefachmann/-frau), business administration (Kaufmann/-frau für Büromanagement), hotel and tourism (Hotelfachmann/-frau), mechatronics (Mechatroniker/-in)" },
                { order: 2, title: "Use the BERUFENET database (berufenet.arbeitsagentur.de) to read the official training description, entry requirements, and salary outlook for your target field" },
                { order: 3, title: "Research which German Bundesländer (states) have the highest demand for your target field: Bavaria, Baden-Württemberg, North Rhine-Westphalia, and Saxony have the most active international programs" },
                { order: 4, title: "Join Facebook groups: 'Ausbildung Indonesia', 'WNI di Jerman', 'Pflegefachmann Indonesia' for firsthand accounts from Indonesians currently in Ausbildung" },
                { order: 5, title: "Create a shortlist of 10–15 specific companies or hospitals actively seeking international trainees in your target field and location" },
                { order: 6, title: "Contact the BAMF (Bundesamt für Migration und Flüchtlinge) or the Make it in Germany hotline for official guidance on recognition and eligibility requirements" },
              ],
            },
          },
          {
            order: 3,
            title: "Document Preparation & Credential Recognition",
            isFree: false,
            description: "Authenticate and translate all academic and civil documents to German standards. This phase determines whether your Indonesian qualifications are recognized.",
            notes: {
              create: [
                { type: "DO", content: "Check the anabin database (anabin.kmk.org) before applying — it lists every Indonesian university and shows whether your specific diploma is recognized in Germany. H+ status means fully recognized." },
                { type: "DONT", content: "Do not use regular commercial translators. Every document submitted to employers and the Ausländerbehörde must be translated by a beeidigter Übersetzer (state-sworn translator) — only their work is legally valid." },
                { type: "COST", content: "Sworn translation per document: Rp500.000–800.000 | Apostille from Kemenlu (per document): Rp150.000–300.000 | Legalization from German Embassy Jakarta: EUR 25–50 per document | Total realistic document budget: Rp10.000.000–20.000.000." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Check your university and diploma on the anabin database (anabin.kmk.org) — note the recognition status (H+, H+/-, or H-)" },
                { order: 2, title: "Get your Indonesian ijazah (diploma) and transkrip nilai (transcripts) officially translated to German by a certified sworn translator (beeidigter Übersetzer)" },
                { order: 3, title: "Obtain apostille legalization for all academic documents at the Indonesian Ministry of Education (Kemdikbud) or Ministry of Foreign Affairs (Kemenlu)" },
                { order: 4, title: "If required by your target employer or field, apply for formal credential recognition through ZAB (Zentralstelle für ausländisches Bildungswesen) or the relevant German professional chamber" },
                { order: 5, title: "Translate your birth certificate (akta kelahiran), family card (KK), and marriage certificate (if applicable) via sworn translator and notarize at a notaris" },
                { order: 6, title: "Create your Lebenslauf in standard German format: tabular, reverse chronological, strictly factual, 1–2 pages, with professional photo (Bewerbungsfoto) — follow the EUROPASS format as a baseline" },
                { order: 7, title: "Write your Anschreiben (cover letter) in formal German: no more than 1 page, address the specific company and Ausbildungsberuf, state your motivation and language level clearly" },
              ],
            },
          },
          {
            order: 4,
            title: "Company Application & Ausbildungsvertrag",
            isFree: false,
            description: "Find, apply, interview, and secure your official Ausbildungsvertrag (training contract). This document is the foundation for your visa application.",
            notes: {
              create: [
                { type: "DO", content: "Apply to at least 20–30 companies. German companies appreciate persistence and professionalism. A personalized Anschreiben for each company dramatically improves response rates." },
                { type: "DONT", content: "Do not sign an Ausbildungsvertrag you have not fully understood. Have a fluent German speaker or your community network review the contract — especially the Ausbildungsvergütung (monthly wage) and start date." },
                { type: "COST", content: "Application costs: zero. German law prohibits employers from charging placement or onboarding fees. Monthly Ausbildungsvergütung: IT fields €700–1.050/month | Nursing €1.100–1.400/month | Business admin €600–800/month." },
                { type: "WARNING", content: "Application windows for August/September start dates open the previous September–November. You must apply 10–12 months in advance. Missing the window means waiting another full year." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Apply via Bundesagentur für Arbeit portal (arbeitsagentur.de) using 'Ausbildungssuche' — filter by Berufsfeld and state, enable the 'internationale Bewerber' option" },
                { order: 2, title: "Apply directly to hospitals (Krankenhäuser), IT companies (SAP, Bosch, Siemens training programs), logistics firms (DHL, DB Schenker), and hotel chains (Marriott, Hilton Germany)" },
                { order: 3, title: "Attend the Bewerbungsgespräch (job interview) online — typically conducted in German with English as fallback. Prepare answers for: 'Warum möchten Sie diese Ausbildung machen?' and 'Warum Deutschland?'" },
                { order: 4, title: "Review all terms of the Ausbildungsvertrag: training duration, start date, Ausbildungsvergütung per year, working hours, vacation entitlement, and Berufsschule schedule" },
                { order: 5, title: "Sign the Ausbildungsvertrag and have it countersigned by your employer — retain a certified copy for your visa application dossier" },
                { order: 6, title: "Confirm your Ausbildung start date (typically August 1 or September 1) with the company's HR and get written confirmation" },
              ],
            },
          },
          {
            order: 5,
            title: "Visa Application at the German Embassy Jakarta",
            isFree: false,
            description: "Apply for the Ausbildung visa (Visum zur Berufsausbildung) at the German Embassy in Jakarta. Slot availability is the biggest bottleneck — book immediately after signing your contract.",
            notes: {
              create: [
                { type: "DO", content: "Book your Termin (embassy appointment) on the day you receive your signed Ausbildungsvertrag. Embassy appointment slots in Jakarta fill 3–4 months in advance for Ausbildung visa category." },
                { type: "DONT", content: "Do not book international flights or resign from your current job until you have the physical visa sticker in your passport. Cases of late rejection exist even after a signed contract." },
                { type: "COST", content: "Embassy visa fee: EUR 75 (~Rp1.300.000) | Biometric photo (35×45mm, embassy-certified): Rp100.000–200.000 | Document legalization at embassy: EUR 25–50 per document | Total visa process cost: approx. Rp2.500.000–5.000.000." },
                { type: "WARNING", content: "Your Ausbildung visa is issued for a specific Bundesland and employer. Changing companies or states in the first 12 months requires applying for a new residency permit — complex and not guaranteed." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Book your Termin (appointment) at the German Embassy Jakarta via deutschebotschaft-jakarta.de — select 'Nationales Visum' category for Ausbildung" },
                { order: 2, title: "Assemble the complete visa dossier: signed Ausbildungsvertrag, Goethe/telc B2 certificate, bank statement (minimum EUR 2.000 or equivalent), Lebenslauf, Anschreiben/motivation letter in German" },
                { order: 3, title: "Obtain Krankenversicherungsnachweis (health insurance confirmation letter) — your employer's HR can provide a letter confirming enrollment in the company health insurance upon arrival" },
                { order: 4, title: "Prepare biometric photos: 35mm × 45mm, white background, recent (within 6 months), printed at embassy-certified photo studio" },
                { order: 5, title: "Attend your embassy appointment with all original documents plus two complete sets of copies — submit documents and provide biometric fingerprints" },
                { order: 6, title: "Pay the EUR 75 visa fee at the embassy during appointment" },
                { order: 7, title: "Wait for visa decision (typically 4–8 weeks processing time) and collect your passport with visa sticker" },
              ],
            },
          },
          {
            order: 6,
            title: "Pre-Departure & Arrival in Germany",
            isFree: false,
            description: "Complete Indonesian departure formalities, arrive in Germany, and complete the mandatory Anmeldung (address registration) within 14 days. This unlocks everything else.",
            notes: {
              create: [
                { type: "DO", content: "Complete your Anmeldung (address registration at the Einwohnermeldeamt) within 14 days of arriving at your permanent address. This is legally mandatory and unlocks your bank account, tax ID, and payroll." },
                { type: "DONT", content: "Do not rely solely on your employer for housing. Many international trainees face short-term housing challenges — research backup options (WG-Gesucht, Studenten-WG, employer Wohnheim) before flying." },
                { type: "COST", content: "One-way flight Jakarta–Frankfurt/Munich: Rp8.000.000–15.000.000 depending on season | First month rent (shared room/WG): EUR 300–600/month | Monthly total living cost as trainee: EUR 600–900 (rent + food + transport + insurance)." },
                { type: "WARNING", content: "Germany can be isolating in the first 3–6 months. Actively invest in building friendships with German colleagues, join local Indonesian community groups (PPIA, WNI), and practice German conversation daily to avoid social isolation." },
              ],
            },
            tasks: {
              create: [
                { order: 1, title: "Book your flight to Germany with at least 5–7 days buffer before your official Ausbildung start date" },
                { order: 2, title: "Arrange first-month accommodation — contact your employer's HR about Wohnheim (company dormitory) or assistance finding a WG (shared apartment) in the area" },
                { order: 3, title: "Complete Anmeldung (address registration) at the local Einwohnermeldeamt within 14 days of arriving at your permanent address — bring rental contract and passport" },
                { order: 4, title: "Open a German bank account: DKB or N26 (online, no branch visit required) or Deutsche Bank / Commerzbank for in-person accounts" },
                { order: 5, title: "Your Sozialversicherungsausweis (social security card) and Steueridentifikationsnummer (tax ID) will be mailed to your registered address — provide these to your employer's HR within your first week" },
                { order: 6, title: "Enroll in the Berufsschule (vocational school) alongside company training — your employer coordinates the enrollment; confirm the schedule in week 1" },
                { order: 7, title: "Register with the nearest Indonesian Consulate-General in Germany (Berlin, Hamburg, Frankfurt, or Munich) for emergency consular services" },
                { order: 8, title: "Join the local Indonesian community: PPIA (Perhimpunan Pelajar Indonesia) chapter in your city, local WNI Facebook groups, and Indonesian church or cultural communities" },
              ],
            },
          },
        ],
      },
    },
  });
}

// ─── INTERVIEW QUESTIONS ──────────────────────────────────────────────────────

async function seedInterviewQuestions() {
  const questions = [
    // BEHAVIORAL ────────────────────────────────────────────────────────────────
    {
      type: "BEHAVIORAL", isFree: true, order: 1,
      question: "Tell me about yourself and why you are applying for this specific role.",
      intent: "Tests your professional self-awareness, communication clarity, and whether your background genuinely aligns with what this company needs — not just what you want. Recruiters time this answer.",
      strategy: "Lead with your current role and context (1 sentence), then state your 1–2 most relevant achievements with numbers. Bridge directly to why this specific company and role — show you researched them. Keep the total answer under 2 minutes.",
      sampleResponse: "I'm a backend developer based in Jakarta with 3 years of experience building payment APIs in Node.js and PostgreSQL. I led two integrations at my current company — one reduced our transaction processing latency by 40%, the other handled Rp4.2 billion in monthly transactions with zero reconciliation errors. I'm applying because I want to contribute to a global product team operating at a scale beyond what's available locally. I specifically chose your company because you're a fully distributed team with public engineering documentation — which aligns with how I already work: async-first, written communication, independent shipping.",
    },
    {
      type: "BEHAVIORAL", isFree: true, order: 2,
      question: "Describe a challenging project you delivered under a tight deadline.",
      intent: "Tests your prioritization under pressure, your ability to make trade-offs, and your capacity to deliver measurable output when conditions are difficult. Vague answers without numbers are rejected.",
      strategy: "Use the full STAR framework: Situation (project context + what made it hard), Task (your specific ownership), Action (the concrete steps you took, especially trade-offs and decisions), Result (quantified outcome). Never give a vague answer — cite real numbers even if approximate.",
      sampleResponse: "A new Bank Indonesia regulation required us to add a full reconciliation feature within 2 weeks. On day 1, I mapped the full scope, then negotiated with the PM to cut one non-critical reporting view from the sprint. I pair-programmed the riskiest database migration logic on day 3 with a senior colleague, which cut our debugging time in half. I also wrote the test suite in parallel with the feature — not after. We shipped on the deadline. The feature processed Rp4.2 billion in its first month with zero reconciliation discrepancies.",
    },
    {
      type: "BEHAVIORAL", isFree: false, order: 3,
      question: "Tell me about a time you disagreed with a manager or senior colleague on a technical decision. What did you do?",
      intent: "Tests your ability to separate technical merit from ego, your communication maturity, and whether you can influence decisions without authority — a critical skill in any remote, flat organization.",
      strategy: "Show that you came with data and a structured alternative, not just an opinion. Describe how you listened actively to the other side. Mention documentation — senior remote teams use RFC (Request for Comments) culture. End with the actual decision made, even if it wasn't yours.",
      sampleResponse: "My tech lead wanted REST polling for real-time notifications. I believed WebSockets were more appropriate. Rather than debating in standup, I spent a weekend building a proof-of-concept with latency numbers and memory usage comparisons under simulated load. I framed it as 'one additional option' in our RFC doc — not a challenge to his judgment. We had a 24-hour async review. The team ultimately chose a hybrid: REST polling with a WebSocket upgrade path — a better answer than either of us started with. I now document all major technical trade-offs in our decision log so future engineers understand the reasoning, not just the outcome.",
    },
    {
      type: "BEHAVIORAL", isFree: false, order: 4,
      question: "What is the biggest professional mistake or failure you have experienced, and what did you learn from it?",
      intent: "Tests your self-awareness, honesty, and growth mindset. Interviewers look for whether you can own mistakes clearly, extract real learning, and apply it — not give a disguised humble-brag.",
      strategy: "Pick a real failure with real consequences. Don't minimize it. State clearly what went wrong and what your specific contribution to that failure was. Then explain the concrete change you made in how you work since then. End with the positive outcome that came from the lesson.",
      sampleResponse: "In my second year, I shipped a database migration script to production without running it on a full data clone first — only on a subset. The script timed out at 3 AM on 1.2 million rows, took the payment service offline for 40 minutes, and affected about 8,000 transactions. It was my script, my call, and my oversight. After that incident, I personally built a pre-deployment migration checklist that's now part of our standard engineering process. I also introduced a 'dark launch' policy for all schema changes: run on a prod replica at full scale, measure execution time, then schedule the real migration during a low-traffic window. In the 18 months since, we haven't had a single unplanned migration incident.",
    },
    {
      type: "BEHAVIORAL", isFree: false, order: 5,
      question: "How do you handle a situation where multiple urgent priorities compete for your attention at the same time?",
      intent: "Tests your ability to make deliberate prioritization decisions under pressure, communicate proactively about trade-offs, and avoid the trap of appearing busy while being ineffective.",
      strategy: "Show a concrete framework you actually use (impact vs. effort matrix, MoSCoW, deadline-first, etc.). Demonstrate that you communicate openly about what you're deprioritizing and why. Mention that you over-communicate when timelines shift — remote teams rely on this.",
      sampleResponse: "When competing priorities hit simultaneously, I list everything out first so I'm making a real decision — not just reacting to whoever shouted last. I then rank by: who's blocked because of me (always first), irreversible consequences (second), and effort required (third). I communicate the trade-off explicitly to stakeholders: 'I'm prioritizing the payment bug because it's customer-facing and blocking three people. The reporting dashboard moves to tomorrow afternoon.' I don't ask permission to prioritize — I inform people of what's happening and give them a chance to override with new information. That approach has saved a lot of silent bottlenecks.",
    },

    // REMOTE & ASYNC ────────────────────────────────────────────────────────────
    {
      type: "REMOTE_ASYNC", isFree: true, order: 1,
      question: "How do you structure your workday and stay productive in a fully remote, async-first environment?",
      intent: "Tests your self-management discipline, written communication quality, and your proactiveness in reducing synchronous dependencies for your teammates — a critical trait in distributed teams.",
      strategy: "Name specific tools and rituals. Show that you default to written-first communication, have a structured daily system, and actively reduce blocking situations for teammates across different timezones.",
      sampleResponse: "My workday runs in two deep-work blocks: 9–12am and 2–5pm Jakarta time, with all meetings and check-ins in the gaps. Before 9am, I post a written standup in our team channel covering what I shipped yesterday, what I'm working on today, and any blockers with proposed solutions — so the US team can read it during their morning. For anything that would take more than 3 back-and-forth messages to explain, I record a 2–3 minute Loom video instead. For decisions, I write a short RFC with my recommended option and give the team 24 hours to review asynchronously before I proceed — unless it's a live incident.",
    },
    {
      type: "REMOTE_ASYNC", isFree: false, order: 2,
      question: "How do you communicate that you're blocked on something without becoming a blocker yourself for the whole team?",
      intent: "Tests your ability to unblock yourself where possible, communicate blockers with enough context for others to act, and maintain team velocity even when you're waiting on input.",
      strategy: "Show that you never send a 'I'm stuck' message without a proposed solution or alternative path. Describe how you document the blocker publicly, give a clear expected resolution time, and keep moving on adjacent work in the meantime.",
      sampleResponse: "My rule is: never report a blocker without a proposed solution or an alternative. If I'm waiting for an API from the backend team, I immediately mock it locally with realistic data structures so I can continue building. I post a message in the relevant thread: 'Blocked on the auth endpoint. Mock built — continuing with checkout flow. If the auth design doesn't change by Thursday EOD, I'll proceed with mock assumptions and we'll integrate Friday.' That way the team knows what I'm doing and when action is needed from them — without interrupting anyone's deep work.",
    },
    {
      type: "REMOTE_ASYNC", isFree: false, order: 3,
      question: "How do you build working relationships with teammates you have never met in person and may never meet?",
      intent: "Tests your emotional intelligence, proactiveness in relationship-building, and ability to establish trust through written and video communication — critical in globally distributed teams.",
      strategy: "Be specific about deliberate practices you use: one-on-one calls, context-sharing beyond work tasks, contributing to team culture documentation, showing genuine interest in colleagues. This is a soft skill test, not a technical one.",
      sampleResponse: "When I join a new team, I schedule a 20-minute async 'get to know me' call with each teammate in my first 2 weeks — just context, not work. I ask about their work style, their timezone preferences, and what frustrates them most in remote collaboration. I take notes and actually adjust my communication style accordingly. Beyond that, I contribute actively to team channels beyond just work: sharing relevant articles, congratulating people on wins publicly, asking for opinions on things outside my lane. I've found that trust in remote teams is built through small consistent acts of visibility and genuine interest — not big gestures.",
    },
    {
      type: "REMOTE_ASYNC", isFree: false, order: 4,
      question: "Walk me through how you would handle a complex, ambiguous technical problem asynchronously when the team is in different timezones.",
      intent: "Tests your ability to drive technical problem-solving without real-time access to teammates — particularly important when you are the primary APAC presence on a US or EU team.",
      strategy: "Show a systematic approach: reproduce the problem, document everything you know and don't know, attempt solutions with documented results, escalate with full context at a sensible timezone-appropriate time. Avoid the 'I wait for my manager' answer.",
      sampleResponse: "First I reproduce it in a clean environment and document exactly what I observe, what I've ruled out, and my current hypothesis — in writing, in the shared channel, with timestamps. I spend one full deep-work block (3–4 hours) working through the problem systematically. If I haven't resolved it, I write up a clear blocker post before the US team wakes up, with: the symptom, what I've tried, my current best hypothesis, and a specific question. That way they wake up with enough context to reply in one message rather than a 6-message back-and-forth. I've found that clear async escalation actually resolves problems faster than a panic Slack message.",
    },

    // VISA & IMMIGRATION ────────────────────────────────────────────────────────
    {
      type: "VISA_IMMIGRATION", isFree: true, order: 1,
      question: "Why did you choose Australia (or Germany) specifically, and how prepared are you for the practical realities of relocating there?",
      intent: "Tests whether your decision is research-backed, financially prepared, and genuinely committed — eliminating candidates who applied impulsively or without realistic planning.",
      strategy: "Be specific about the professional opportunity, not just lifestyle appeal. Name the specific visa program, the career path it enables, and demonstrate that you've planned for the financial and logistical realities.",
      sampleResponse: "I chose the WHV Subclass 417 specifically because it gives 12 months of open work rights across multiple employers in Sydney's tech and SaaS ecosystem — which is a real career acceleration path, not just a holiday. I've researched that Melbourne and Sydney have growing fintech companies actively hiring full-stack developers with APAC timezone skills, which is a genuine advantage for me. I'm targeting 3 months of regional work first to qualify for the second-year extension, giving me the runway to build a network and target a sponsored position. I have AUD 8,000 saved, an Australian bank account already opened, and my TFN application is prepared to submit on arrival.",
    },
    {
      type: "VISA_IMMIGRATION", isFree: false, order: 2,
      question: "How do you plan to handle cultural and professional differences in a Western workplace?",
      intent: "Tests your cross-cultural self-awareness and your readiness to adapt to communication norms, feedback culture, and workplace dynamics that differ significantly from Indonesian professional environments.",
      strategy: "Show specific examples of cultural adjustments you've already made. Mention real differences you are aware of (direct feedback, flat hierarchy, 'disagree and commit' norms) and how you have actively practiced these. Avoid generic answers about 'being open-minded'.",
      sampleResponse: "I've been working remotely with a US-based company for 18 months, so I've already experienced the shift from indirect feedback to direct, constructive criticism as the normal professional mode. The biggest adjustment for me was learning to speak up in group meetings rather than defaulting to agreement — I had to actively practice saying 'I disagree because...' in real-time, not just in a follow-up message. I've also gotten comfortable with the concept of 'low-context communication' — writing everything out explicitly rather than assuming shared understanding. I still make mistakes, but I actively ask for feedback after important interactions, which has helped me calibrate faster.",
    },
    {
      type: "VISA_IMMIGRATION", isFree: false, order: 3,
      question: "What is your contingency plan if your visa is delayed significantly or rejected?",
      intent: "Tests your emotional resilience, financial planning depth, and practical preparation quality. Companies investing in international candidates want to know you have a realistic backup plan.",
      strategy: "Show that you have researched realistic timelines and have financial buffer planned. Describe a specific alternative path (reapply, different visa category, maintain current employment). Avoid saying 'I haven't thought about that' — it signals poor planning.",
      sampleResponse: "My current employer knows I'm pursuing this, and I have an agreement to stay on in a contractor capacity if the timeline extends beyond my original plan. Financially, I have a 6-month living cost buffer in Indonesia so I'm not making decisions from a position of financial pressure. If rejected, I'd request a detailed reason, address any documentation gaps, and reapply in the next cycle. I've also identified an alternative in the Digital Working Holiday or Global Talent pathway depending on the specific rejection reason. The goal is Australia, but I'm building the professional profile that works for multiple paths simultaneously.",
    },
    {
      type: "VISA_IMMIGRATION", isFree: false, order: 4,
      question: "How will you handle finances and housing in the first month after arriving abroad with no established income?",
      intent: "Tests your practical preparation and risk management. An unprepared financial situation in month 1 is the most common reason WHV holders or international trainees return home early.",
      strategy: "Name specific dollar amounts or euro amounts. Describe your pre-arranged housing, your banking setup, your emergency contacts, and how long your buffer gives you before income pressure begins. Show you planned for this — not just thought about it.",
      sampleResponse: "I've budgeted AUD 8,000 as my opening fund — which gives me 3 months of moderate cost of living (AUD 2,500/month) before any income pressure. My accommodation for the first 2 weeks is pre-booked: a backpacker hostel in Melbourne's CBD with weekly kitchen access for under AUD 300. My Australian bank account is already open and funded with AUD 2,000 transferred ahead of departure. I have a contact in Melbourne from my WHV community who can give me practical guidance on local job applications. Within the first week, I'm targeting RSA certification and registering on Seek and Gumtree with a local phone number — the two fastest paths to casual hospitality income.",
    },
  ];

  for (const q of questions) {
    await prisma.interviewQuestion.create({ data: q });
  }
}

// ─── SALARY RANGES ────────────────────────────────────────────────────────────

async function seedSalaryRanges() {
  const data = [
    // SOFTWARE ENGINEER ─────────────────────────────────────────────────────────
    { category: "Software Engineer", level: "JUNIOR", region: "US", minUsd: 3000, maxUsd: 5000, negotiationNote: "Quote $4,200 as your opening anchor. For US roles, emphasize: async communication fluency, APAC timezone overlap as a genuine asset for teams with global users, and any experience with US-standard tooling (GitHub Actions, AWS, Stripe, Vercel). Any portfolio project with real production traffic strengthens your position toward the upper range." },
    { category: "Software Engineer", level: "MID", region: "US", minUsd: 5500, maxUsd: 9000, negotiationNote: "Quote $7,500 as your anchor. Mid-level means you own complete features end-to-end. Lead your negotiation with: a production system you built serving 10k+ users, a measurable performance improvement (latency, uptime, cost reduction), or a project that generated direct revenue. These specifics justify the upper range far more than years of experience alone." },
    { category: "Software Engineer", level: "SENIOR", region: "US", minUsd: 9000, maxUsd: 15000, negotiationNote: "Quote $12,000 as your anchor. Senior candidates must lead with depth, not breadth. Prepare concrete system design stories: what was the scale, what architectural decisions did you make, what were the trade-offs, what was the outcome? Senior remote roles also expect mentorship evidence — be ready to describe a junior engineer you measurably improved." },
    { category: "Software Engineer", level: "JUNIOR", region: "EU", minUsd: 2500, maxUsd: 4000, negotiationNote: "Quote €3,000/month gross as your anchor. EU roles typically offer stronger benefits packages than equivalent US roles: learning budget (€1,000–2,000/year is standard), longer vacation (25–30 days), and structured training programs. Factor these into your total compensation evaluation and mention them explicitly during negotiation." },
    { category: "Software Engineer", level: "MID", region: "EU", minUsd: 4500, maxUsd: 7000, negotiationNote: "Quote €5,500/month gross as your anchor. Mid-level EU roles often include profit-sharing, equity options, or performance bonuses not mentioned in the initial offer. Ask explicitly: 'Is there a variable component to the total compensation?' Many EU companies also cover relocation costs — negotiate this upfront if applicable." },
    { category: "Software Engineer", level: "SENIOR", region: "EU", minUsd: 7500, maxUsd: 12000, negotiationNote: "Quote €9,000/month gross as your anchor. German and Dutch tech companies (Berlin, Amsterdam, Munich) generally pay at the high end. DACH region companies have a reputation for structured promotion paths — ask about the competency framework and the criteria for promotion to Staff or Principal level." },
    { category: "Software Engineer", level: "JUNIOR", region: "APAC", minUsd: 1500, maxUsd: 3000, negotiationNote: "Quote $2,200/month as your anchor. APAC roles (Singapore, Australia, Japan-based) vary widely in range. Singapore-based roles pay closer to $3,000 for juniors. Australian WHV holders working remotely for AU-based companies typically earn AUD 65,000–85,000 annually. Emphasize reliability, clear English communication, and specific domain knowledge (fintech, logistics, e-commerce)." },
    { category: "Software Engineer", level: "MID", region: "APAC", minUsd: 3500, maxUsd: 6000, negotiationNote: "Quote $4,500/month as your anchor. Mid-level APAC remote roles are competitive — Singapore, Hong Kong, and Sydney companies are actively hiring Indonesian engineers. Emphasize proximity of timezone (WIB is UTC+7, close to SGT UTC+8 and AEST UTC+10) as a genuine collaboration advantage." },
    { category: "Software Engineer", level: "SENIOR", region: "APAC", minUsd: 6000, maxUsd: 10000, negotiationNote: "Quote $8,000/month for Singapore-based roles. Senior APAC remote roles often involve team leadership or technical lead responsibilities. If asked to lead a team, negotiate an additional 15–20% on top of the IC senior range." },
    { category: "Software Engineer", level: "JUNIOR", region: "GLOBAL_REMOTE", minUsd: 1500, maxUsd: 3000, negotiationNote: "Quote $2,200/month. Global remote junior roles have a wide range depending on the company's location adjustment policy. Ask directly: 'Does your compensation adjust for location, and what's the policy for future adjustments?' Location-agnostic pay (US-rate regardless of where you live) has become more common at well-funded startups." },
    { category: "Software Engineer", level: "MID", region: "GLOBAL_REMOTE", minUsd: 3000, maxUsd: 6000, negotiationNote: "Quote $4,200/month. Mid-level global remote roles reward specialization. A strong backend specialization (distributed systems, payment processing, database optimization) or a clear frontend niche (React/Next.js performance, design systems) commands the upper range. Full-stack generalists should anchor at the midpoint." },
    { category: "Software Engineer", level: "SENIOR", region: "GLOBAL_REMOTE", minUsd: 6000, maxUsd: 11000, negotiationNote: "Quote $8,500/month. Senior global remote roles are highly competitive but the talent pool is genuinely global — your Indonesian timezone is often a specific advantage for companies that need APAC coverage. Be explicit about this in your application: 'I cover APAC hours and can bridge to EU morning overlap.'"},

    // UI/UX DESIGNER ────────────────────────────────────────────────────────────
    { category: "UI/UX Designer", level: "JUNIOR", region: "US", minUsd: 2500, maxUsd: 4500, negotiationNote: "Quote $3,800 as your anchor. For junior design roles, your Figma portfolio link outweighs your resume. Include it in your first outreach email. For US teams, show: mobile responsiveness consideration, accessibility thinking (WCAG AA), and clear documentation of your design decisions — not just beautiful screens." },
    { category: "UI/UX Designer", level: "MID", region: "US", minUsd: 5000, maxUsd: 8500, negotiationNote: "Quote $6,500 as your anchor. Mid-level US designers who can articulate the business decisions behind their design choices — conversion rates, user research findings, A/B test outcomes — justify the upper range. Pure visual execution mid-level designers anchor at $5,500." },
    { category: "UI/UX Designer", level: "SENIOR", region: "US", minUsd: 8500, maxUsd: 14000, negotiationNote: "Quote $11,000 as your anchor. Senior design roles in the US increasingly require design systems ownership, cross-functional leadership (working directly with PMs and engineers), and the ability to conduct and synthesize user research independently. Evidence of both is needed to justify the upper range." },
    { category: "UI/UX Designer", level: "JUNIOR", region: "EU", minUsd: 2000, maxUsd: 3500, negotiationNote: "Quote €2,800/month gross. EU junior design roles are common in Berlin, Amsterdam, and Lisbon tech ecosystems. Include your Behance or Figma portfolio link. German companies appreciate very structured process documentation — show your research-to-wireframe-to-prototype workflow clearly." },
    { category: "UI/UX Designer", level: "MID", region: "EU", minUsd: 3500, maxUsd: 6000, negotiationNote: "Quote €4,500/month gross. Dutch and German mid-level UX roles often require B2 German language for healthcare or government-adjacent companies. For international tech companies in these markets, English is sufficient." },
    { category: "UI/UX Designer", level: "MID", region: "GLOBAL_REMOTE", minUsd: 2500, maxUsd: 5000, negotiationNote: "Quote $3,500/month. Remote design roles increasingly require basic Framer, CSS handoff, or Storybook familiarity — mention these if applicable. Product design experience (owning flows end-to-end, not just screens) commands the upper range over pure visual design." },
    { category: "UI/UX Designer", level: "JUNIOR", region: "GLOBAL_REMOTE", minUsd: 1200, maxUsd: 2500, negotiationNote: "Quote $1,800/month. Junior remote design roles are highly competitive globally. Differentiate with a niche: mobile-first UI for fintech, design system documentation, or accessibility-focused design. Even a personal project demonstrating these skills is worth including in your portfolio." },

    // DATA ANALYST ──────────────────────────────────────────────────────────────
    { category: "Data Analyst", level: "JUNIOR", region: "US", minUsd: 2500, maxUsd: 4500, negotiationNote: "Quote $3,500 as your anchor. Junior data roles require: SQL (must be confident with CTEs, window functions, and query optimization), Python with pandas, and at least one BI tool (Tableau, Looker, Metabase, Power BI). Mention any experience with dbt or Airbyte — these are increasingly standard in modern data stacks." },
    { category: "Data Analyst", level: "MID", region: "US", minUsd: 4500, maxUsd: 8000, negotiationNote: "Quote $6,000 as your anchor. Mid-level data analysts in US companies are expected to own reporting infrastructure end-to-end — not just answer ad-hoc queries. Show evidence of: a dashboard that became a permanent business tool, a data quality initiative you led, or an analysis that directly influenced a product or business decision." },
    { category: "Data Analyst", level: "SENIOR", region: "US", minUsd: 8000, maxUsd: 13000, negotiationNote: "Quote $10,000 as your anchor. Senior data roles blend analytics with data engineering. Expertise in: data modeling (dimensional or OBT), pipeline ownership (Airflow, Prefect), and stakeholder communication at executive level all justify the upper range." },
    { category: "Data Analyst", level: "MID", region: "APAC", minUsd: 2000, maxUsd: 4500, negotiationNote: "Quote $3,000/month. Strong SQL and Python (pandas, numpy) are the baseline. Any dashboard work in Tableau, Looker, or Metabase directly increases your value. Singapore-based data roles pay AUD/SGD-adjusted rates that typically translate to the higher end of this range." },
    { category: "Data Analyst", level: "MID", region: "GLOBAL_REMOTE", minUsd: 2500, maxUsd: 5000, negotiationNote: "Quote $3,500/month. Remote data analyst roles demand strong documentation skills — your analysis must be reproducible and clearly explained. Mention any experience with Jupyter notebooks, Notion-based data dictionaries, or Notion BI as these signal you communicate analysis clearly to non-technical audiences." },

    // PRODUCT MANAGER ───────────────────────────────────────────────────────────
    { category: "Product Manager", level: "MID", region: "US", minUsd: 6000, maxUsd: 11000, negotiationNote: "Quote $8,500 as your anchor. Remote PM roles are among the most competitive at this level. You must demonstrate clear ownership of a shipped product: what metrics defined success, what decisions you made and why, what you would do differently. Come prepared with 2–3 product case studies with real numbers, not process descriptions." },
    { category: "Product Manager", level: "SENIOR", region: "US", minUsd: 11000, maxUsd: 18000, negotiationNote: "Quote $14,000 as your anchor. Senior PM roles in the US require evidence of cross-functional leadership at scale (leading engineers, designers, data analysts, legal), strategic roadmap ownership, and the ability to influence without authority across the company. Portfolio evidence is non-negotiable at this level." },
    { category: "Product Manager", level: "MID", region: "EU", minUsd: 5000, maxUsd: 9000, negotiationNote: "Quote €6,500/month gross. European PM culture tends toward more structured processes and documentation than US-style PMs. Familiarity with Basecamp, Linear, or detailed PRD-writing culture is valued. German companies in particular value Pflichtenheft (detailed requirement specifications) experience." },
    { category: "Product Manager", level: "MID", region: "GLOBAL_REMOTE", minUsd: 3500, maxUsd: 7000, negotiationNote: "Quote $5,000/month. Global remote PM roles require strong async communication skills above all else. You must be able to run a sprint, resolve blockers, and ship decisions entirely through written communication and async video. This is a significantly different working style from co-located or synchronous product management." },

    // DEVOPS / CLOUD ENGINEER ───────────────────────────────────────────────────
    { category: "DevOps / Cloud Engineer", level: "MID", region: "US", minUsd: 6000, maxUsd: 10000, negotiationNote: "Quote $8,000 as your anchor. Mid-level DevOps roles require: solid AWS/GCP/Azure experience (at minimum 2 certifications), Kubernetes and Helm chart familiarity, CI/CD pipeline ownership (GitHub Actions, CircleCI, Jenkins), and IaC experience (Terraform or Pulumi). Any experience reducing infrastructure cost is a compelling negotiation point." },
    { category: "DevOps / Cloud Engineer", level: "SENIOR", region: "US", minUsd: 10000, maxUsd: 17000, negotiationNote: "Quote $13,000 as your anchor. Senior DevOps/SRE roles require on-call incident management experience, SLO/SLI framework design, and organizational platform engineering leadership. Security certification (AWS Security Specialty, CKS) or experience with compliance frameworks (SOC 2, ISO 27001) adds 15–20% to your negotiation position." },
    { category: "DevOps / Cloud Engineer", level: "MID", region: "GLOBAL_REMOTE", minUsd: 4000, maxUsd: 7500, negotiationNote: "Quote $5,500/month. Remote DevOps roles require exceptional documentation and runbook-writing skills — every incident response process must be documented so teammates in different timezones can follow it independently. Mention your documentation culture explicitly in interviews." },
    { category: "DevOps / Cloud Engineer", level: "SENIOR", region: "GLOBAL_REMOTE", minUsd: 7000, maxUsd: 12000, negotiationNote: "Quote $9,000/month. Senior remote DevOps candidates must demonstrate autonomous incident leadership across timezone gaps — your US teammates may be asleep when an alert fires. Show evidence of clear on-call playbooks, post-mortem culture, and async incident communication." },

    // DIGITAL MARKETING ─────────────────────────────────────────────────────────
    { category: "Digital Marketing", level: "JUNIOR", region: "US", minUsd: 1800, maxUsd: 3500, negotiationNote: "Quote $2,800 as your anchor. For US remote marketing roles, demonstrate: Google Analytics 4 proficiency, Meta Ads Manager experience with conversion-optimized campaigns, and at least one case study where you improved a specific metric (CTR, CPA, ROAS). Certifications (Google Ads, Meta Blueprint, HubSpot) strengthen your position at this level." },
    { category: "Digital Marketing", level: "MID", region: "US", minUsd: 3500, maxUsd: 7000, negotiationNote: "Quote $5,000 as your anchor. Mid-level US marketing roles increasingly expect: full-funnel ownership (awareness to retention), marketing attribution modeling, and basic SQL for data-pull independence. Any campaign with measurable ROAS above 4x or an SEO project with documented traffic growth justifies the upper range." },
    { category: "Digital Marketing", level: "JUNIOR", region: "GLOBAL_REMOTE", minUsd: 1000, maxUsd: 2200, negotiationNote: "Quote $1,600/month. Global remote junior marketing roles are highly competitive. Differentiate with a specific niche: email marketing (Klaviyo, Mailchimp), SEO content writing with demonstrated ranking results, or paid social for e-commerce. A personal project or freelance case study with real metrics is more valuable than certifications alone." },
    { category: "Digital Marketing", level: "MID", region: "GLOBAL_REMOTE", minUsd: 2500, maxUsd: 5000, negotiationNote: "Quote $3,500/month. Remote marketing roles in global SaaS companies require strong English writing skills, cross-cultural audience understanding, and tool proficiency across multiple platforms. The ability to work independently on campaigns without daily check-ins is the primary qualifier for the upper range." },
    { category: "Digital Marketing", level: "MID", region: "APAC", minUsd: 2000, maxUsd: 4500, negotiationNote: "Quote $3,000/month for APAC-based roles. Southeast Asian digital marketing roles (Singapore, regional remote) value: Bahasa Indonesia/Malay market understanding, TikTok advertising experience, and regional platform familiarity (Shopee, Tokopedia, Lazada advertising ecosystems)." },

    // CONTENT WRITER ────────────────────────────────────────────────────────────
    { category: "Content Writer", level: "JUNIOR", region: "GLOBAL_REMOTE", minUsd: 800, maxUsd: 2000, negotiationNote: "Quote $1,500/month for remote junior writing roles. Writing roles are among the most competitive at entry level globally. Include direct links to published work that has real organic traffic or measurable engagement. Even 500 monthly Google organic visits to a personal blog is worth mentioning. Avoid applying with only academic writing samples." },
    { category: "Content Writer", level: "MID", region: "US", minUsd: 2500, maxUsd: 5000, negotiationNote: "Quote $3,500/month for SEO-focused content roles. Demonstrate a specific, measurable SEO outcome: a 20% organic traffic lift from a content campaign, 5 articles ranking on page 1 for target keywords, or a published brand content piece that drove email list growth. Numbers matter far more than writing samples alone." },
    { category: "Content Writer", level: "MID", region: "EU", minUsd: 2200, maxUsd: 4500, negotiationNote: "Quote €3,000/month gross for EU content roles. European tech companies often require content writers to also manage their own editorial calendar, conduct basic keyword research, and liaise with SEO and product teams independently. Experience with Notion, Contentful, or Strapi CMS is a common requirement." },
    { category: "Content Writer", level: "MID", region: "GLOBAL_REMOTE", minUsd: 1800, maxUsd: 3500, negotiationNote: "Quote $2,500/month. Remote content writing roles reward specialization. Technical writers (developer docs, API documentation, product changelog) earn 20–40% more than general content writers. If you have any technical writing samples, include them even if the job description is for 'general content'." },

    // CUSTOMER SUCCESS ──────────────────────────────────────────────────────────
    { category: "Customer Success", level: "JUNIOR", region: "US", minUsd: 2500, maxUsd: 4000, negotiationNote: "Quote $3,200 as your anchor. US remote CSM roles emphasize: proactive communication, CRM tool familiarity (HubSpot, Salesforce, Intercom), and the ability to identify expansion opportunities within existing accounts. Even basic experience with customer onboarding calls strengthens a junior application significantly." },
    { category: "Customer Success", level: "MID", region: "US", minUsd: 4500, maxUsd: 7500, negotiationNote: "Quote $6,000 as your anchor. Mid-level CSM roles in US SaaS companies are measured on net revenue retention (NRR) — know this metric and have a number ready. Any experience with QBRs (Quarterly Business Reviews), expansion revenue generation, or churn prevention initiatives with documented outcomes justifies the upper range." },
    { category: "Customer Success", level: "MID", region: "GLOBAL_REMOTE", minUsd: 2500, maxUsd: 5000, negotiationNote: "Quote $3,500/month. Remote CSM roles require excellent async written communication — your emails and documentation represent the company to customers. Mention experience handling escalations in writing, building help center content, or creating onboarding materials that reduced support volume." },

    // QA / TEST ENGINEER ────────────────────────────────────────────────────────
    { category: "QA / Test Engineer", level: "JUNIOR", region: "US", minUsd: 2500, maxUsd: 4500, negotiationNote: "Quote $3,500 as your anchor. Modern QA roles are shifting from manual to automation-first. Even basic Cypress, Playwright, or Selenium experience significantly increases your value at junior level. Mention any experience with API testing (Postman collections, k6 load testing) — these are increasingly standard." },
    { category: "QA / Test Engineer", level: "MID", region: "US", minUsd: 5000, maxUsd: 8000, negotiationNote: "Quote $6,500 as your anchor. Mid-level QA roles in US companies expect: end-to-end test suite ownership, CI/CD pipeline integration for automated tests, and the ability to write clear bug reports with reproducible steps and environment details. Any experience with performance testing (JMeter, Locust, k6) is a strong differentiator." },
    { category: "QA / Test Engineer", level: "MID", region: "GLOBAL_REMOTE", minUsd: 2500, maxUsd: 5500, negotiationNote: "Quote $3,800/month. Remote QA roles reward thoroughness and documentation excellence. Your test plans, bug reports, and test case documentation must be clear enough for engineers in different timezones to understand without a synchronous call. This communication quality is what separates mid-level from junior QA candidates remotely." },
  ];

  for (const s of data) {
    await prisma.salaryRange.create({ data: s });
  }
}

// ─── ASSETS ───────────────────────────────────────────────────────────────────

async function seedAssets() {
  const assets = [
    // CV TEMPLATES ──────────────────────────────────────────────────────────────
    {
      title: "US-Style ATS Resume Template",
      category: "ATS_CV_TEMPLATE",
      format: "DOCX",
      description: "Single-column, zero-design, text-optimized layout for US Applicant Tracking Systems. Based on Harvard OCS format. Passes all major ATS parsers (Greenhouse, Lever, Workday). Includes section guidance for remote work applicants.",
      notionUrl: "https://www.notion.so/templates/ats-resume",
      isActive: true,
    },
    {
      title: "German Lebenslauf (Tabellarischer)",
      category: "ATS_CV_TEMPLATE",
      format: "DOCX",
      description: "Strict German tabular CV format required for all Ausbildung applications and corporate roles in the DACH region. Includes: Bewerbungsfoto placement guide, correct date format (TT.MM.JJJJ), reverse-chronological structure, and formal German section headers.",
      notionUrl: "https://www.notion.so/templates/lebenslauf",
      isActive: true,
    },
    {
      title: "EU Europass CV (Standard Format)",
      category: "ATS_CV_TEMPLATE",
      format: "PDF",
      description: "EU standard CV format accepted across all European Union member states and required by many public sector employers and embassies in the DACH and Benelux regions. Includes digital signatures support and Europass online link.",
      notionUrl: "https://europa.eu/europass/en/create-europass-cv",
      isActive: true,
    },
    {
      title: "Australian Resume Template (AU Format)",
      category: "ATS_CV_TEMPLATE",
      format: "DOCX",
      description: "Australian-specific resume format with Professional Summary, Work Rights section (WHV Subclass 417), Australian phone number format, and ATO TFN disclosure guidance. Tailored for WHV holders applying to Seek.com.au roles.",
      notionUrl: "https://www.notion.so/templates/au-resume",
      isActive: true,
    },
    {
      title: "Tech Role Resume — Remote-First Version",
      category: "ATS_CV_TEMPLATE",
      format: "DOCX",
      description: "Specifically structured for remote tech roles at US and EU companies. Features: timezone section, async communication skills block, GitHub/portfolio integration, and quantified impact statements optimized for non-ATS human review at early-stage companies.",
      notionUrl: "https://www.notion.so/templates/remote-tech-resume",
      isActive: true,
    },
    {
      title: "LinkedIn Profile Optimization Guide",
      category: "ATS_CV_TEMPLATE",
      format: "PDF",
      description: "32-point checklist for optimizing your LinkedIn profile for international remote job searches. Covers: headline keyword strategy, About section framework, experience quantification, endorsement strategy, and how to signal 'open to remote' to global recruiters effectively.",
      notionUrl: "https://www.notion.so/templates/linkedin-guide",
      isActive: true,
    },

    // REMOTE JOB TOOLKIT ────────────────────────────────────────────────────────
    {
      title: "Cold Email Outreach Framework for Remote Jobs",
      category: "REMOTE_JOB_TOOLKIT",
      format: "Notion Template",
      description: "7 proven cold email templates for reaching remote hiring managers directly — bypassing ATS entirely. Includes: subject line formulas tested at 40%+ open rates, CTA structures, follow-up sequence timing, and a tracker template. Based on 200+ outreach campaigns by Indonesian remote workers.",
      notionUrl: "https://www.notion.so/templates/cold-email",
      isActive: true,
    },
    {
      title: "Remote Job Platforms Mega-List (70+ Platforms)",
      category: "REMOTE_JOB_TOOLKIT",
      format: "Notion Template",
      description: "Curated database of 70+ remote job platforms with filters: pay range, location restrictions, Indonesian applicant friendliness, time-to-response, and platform focus (tech, design, marketing, writing, customer success). Updated quarterly. Includes 15 platforms most Indonesian applicants are unaware of.",
      notionUrl: "https://www.notion.so/templates/remote-platforms",
      isActive: true,
    },
    {
      title: "Async Communication Playbook",
      category: "REMOTE_JOB_TOOLKIT",
      format: "Notion Template",
      description: "Complete guide to working in async-first remote teams. Covers: written standup formats, RFC (Request for Comments) writing, how to escalate blockers without creating synchronous dependencies, Loom video communication norms, and documentation culture expectations at US/EU companies.",
      notionUrl: "https://www.notion.so/templates/async-playbook",
      isActive: true,
    },
    {
      title: "Salary Negotiation Email Scripts",
      category: "REMOTE_JOB_TOOLKIT",
      format: "DOCX",
      description: "8 negotiation email templates covering: initial offer response, counter-offer framing, negotiating benefits beyond base pay, handling the 'we can't go higher' response, and requesting a signing bonus. Specific scripts for US, EU, and global remote offer contexts.",
      notionUrl: "https://www.notion.so/templates/negotiation-scripts",
      isActive: true,
    },
    {
      title: "Remote Work Readiness Self-Assessment",
      category: "REMOTE_JOB_TOOLKIT",
      format: "PDF",
      description: "30-point readiness audit across 5 dimensions: technical setup (internet, equipment, backup), async communication skills, self-management and focus rituals, timezone management, and professional visibility. Includes a scoring guide and specific improvement steps for each weak area.",
      notionUrl: "https://www.notion.so/templates/remote-readiness",
      isActive: true,
    },
    {
      title: "Portfolio Website Blueprint (Non-Designer Edition)",
      category: "REMOTE_JOB_TOOLKIT",
      format: "Notion Template",
      description: "Step-by-step guide to building a portfolio website for developers, marketers, and non-designers. Covers: what to include by role, free hosting (Vercel, Netlify, GitHub Pages), Notion as a CMS, content strategy for the About and Projects sections, and SEO basics for discoverability by global recruiters.",
      notionUrl: "https://www.notion.so/templates/portfolio-blueprint",
      isActive: true,
    },

    // GLOBAL VISA KIT ───────────────────────────────────────────────────────────
    {
      title: "WHV Australia — Complete Document Checklist",
      category: "GLOBAL_VISA_KIT",
      format: "PDF",
      description: "Comprehensive 14-item document checklist for WHV Subclass 417 application including: exact validity requirements, stamping and certification standards, file format requirements for IMMI upload, and common rejection reasons with prevention tips. Updated for the current IMMI portal version.",
      notionUrl: "https://www.notion.so/templates/whv-checklist",
      isActive: true,
    },
    {
      title: "SDUWHV Request Letter Template",
      category: "GLOBAL_VISA_KIT",
      format: "DOCX",
      description: "Official template for requesting the SDUWHV (Surat Dukungan WHV) from the Indonesian Ministry of Foreign Affairs (Kemenlu RI). Includes: correct letter format per Kemenlu requirements, required attachments list, submission address and procedure, and expected processing timeline.",
      notionUrl: "https://www.notion.so/templates/sduwhv-template",
      isActive: true,
    },
    {
      title: "Bank Statement Sufficiency Guide",
      category: "GLOBAL_VISA_KIT",
      format: "PDF",
      description: "Exact format, stamping, and content requirements for bank proof accepted by Australian IMMI (AUD 5,000 minimum) and the German Embassy Jakarta (EUR 2,000 minimum). Covers: which Indonesian bank formats are accepted, teller stamp requirements, currency conversion documentation, and common rejection scenarios.",
      notionUrl: "https://www.notion.so/templates/bank-guide",
      isActive: true,
    },
    {
      title: "Ausbildung Application Document Dossier",
      category: "GLOBAL_VISA_KIT",
      format: "DOCX",
      description: "Complete document bundle template for Ausbildung visa applications: Lebenslauf template, Anschreiben framework, motivation letter guide, Zeugnisse (certificate) organization format, and the full German Embassy Jakarta document checklist. Includes notes on apostille and sworn translation requirements.",
      notionUrl: "https://www.notion.so/templates/ausbildung-dossier",
      isActive: true,
    },
    {
      title: "Working Holiday Countries Comparison Guide",
      category: "GLOBAL_VISA_KIT",
      format: "PDF",
      description: "Side-by-side comparison of 8 Working Holiday Visa programs available to Indonesian citizens: Australia (417), New Zealand, UK (Youth Mobility), Germany (Aufenthaltserlaubnis für Berufstätigkeit), South Korea, Japan, France, and Canada. Covers: age limits, costs, annual quotas, work restrictions, and realistic income expectations for each country.",
      notionUrl: "https://www.notion.so/templates/whv-comparison",
      isActive: true,
    },
    {
      title: "German Embassy Jakarta — Visa Appointment Guide",
      category: "GLOBAL_VISA_KIT",
      format: "PDF",
      description: "Step-by-step guide to booking and preparing for your German Embassy Termin (appointment) in Jakarta. Covers: how to use the online booking system, optimal booking timing windows, exact document checklist per visa category (Ausbildung, Job Seeker, Employment), biometric photo requirements, and common appointment-day mistakes.",
      notionUrl: "https://www.notion.so/templates/german-embassy-guide",
      isActive: true,
    },
    {
      title: "ATO Tax Return & DASP Guide for WHV Holders",
      category: "GLOBAL_VISA_KIT",
      format: "PDF",
      description: "Complete guide to filing your Australian tax return and claiming your Departing Australia Superannuation Payment (DASP) as a WHV holder. Covers: myTax step-by-step, required employer information, how to find lost super balances, DASP application process, 65% withholding tax explanation, and expected payout timeline.",
      notionUrl: "https://www.notion.so/templates/ato-guide",
      isActive: true,
    },
  ];

  for (const a of assets) {
    await prisma.asset.create({ data: a });
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Clearing existing seed data...");
  await clearAll();

  console.log("Seeding roadmaps...");
  await seedRoadmaps();

  console.log("Seeding interview questions...");
  await seedInterviewQuestions();

  console.log("Seeding salary ranges...");
  await seedSalaryRanges();

  console.log("Seeding assets...");
  await seedAssets();

  console.log("✓ Seed completed successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
