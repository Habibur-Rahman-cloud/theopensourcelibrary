import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Scale } from 'lucide-react';

const LAST_UPDATED = 'April 11, 2026';
const CONTACT_EMAIL = 'pixelnodecorporations@gmail.com';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-black text-heading tracking-tight">{title}</h2>
    <div className="text-muted text-sm sm:text-base leading-relaxed space-y-3 font-medium">{children}</div>
  </section>
);

const TermsOfService = () => {
  return (
    <div className="pt-28 pb-24 px-6 min-h-screen relative overflow-hidden">
      <div className="absolute -bottom-[15%] -left-[10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
            <Scale size={16} className="text-accent" />
            <span className="text-accent text-xs font-black uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-heading tracking-tighter">Terms of Service</h1>
          <p className="text-muted text-sm font-semibold">
            Last updated: {LAST_UPDATED} · The Opensource Library · India
          </p>
          <p className="text-muted text-sm leading-relaxed border-l-2 border-accent/40 pl-4">
            These Terms govern your access to and use of our website, downloads, newsletter, book request features, and
            any related services. By using the service, you agree to these Terms. If you do not agree, do not use the
            service.
          </p>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-3xl p-8 md:p-10 border border-glass-border space-y-10"
        >
          <Section title="1. The service">
            <p>
              The Opensource Library provides access to digital educational resources (including PDF documents),
              browsing features, a newsletter, and optional community features such as book requests and contributor
              flows described on the site. Features may change over time.
            </p>
            <p>
              We may add advertisements, sponsored placements, or affiliate links. Advertisers are responsible for
              their own content; your dealings with advertisers are solely between you and them.
            </p>
          </Section>

          <Section title="2. Eligibility and acceptable use">
            <p>
              You must comply with all applicable laws. You agree not to misuse the service, including by attempting to
              gain unauthorized access, disrupting the site, scraping in a way that harms performance, distributing
              malware, harassing others, or using the service for unlawful purposes.
            </p>
            <p>
              If you are under the age required by applicable law to enter into agreements in your region, you must use
              the service only with a parent or guardian&apos;s permission.
            </p>
          </Section>

          <Section title="3. Accounts, newsletter, and book requests">
            <p>
              Some features require you to provide an email address. You agree that the information you provide is
              accurate and that you will keep it updated where relevant.
            </p>
            <p>
              Newsletter subscriptions may require email verification. Book requests may only be submitted using an
              email address that matches a verified newsletter subscription, as implemented on the website.
            </p>
            <p>
              You are responsible for safeguarding access to your email inbox and any credentials used to interact with
              third-party services linked from our site.
            </p>
          </Section>

          <Section title="4. Intellectual property and content">
            <p>
              The website design, branding, text, graphics, and original materials we create are owned by us or our
              licensors and are protected by intellectual property laws.
            </p>
            <p>
              PDF files and other materials made available through the library may be submitted by contributors or
              sourced through community workflows. We aim to promote open access to educational materials, but we do not
              claim that every file is free of third-party rights in every jurisdiction.
            </p>
            <p>
              If you believe content on the service infringes your rights, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-bold hover:underline">
                {CONTACT_EMAIL}
              </a>{' '}
              with enough detail for us to evaluate the claim (including identification of the work, the material on
              our service, and your contact information). We may remove or disable access to content when appropriate.
            </p>
            <p>
              If you submit content for publication, you represent that you have the rights needed to grant us a license
              to host, display, reproduce, and distribute that content in connection with operating the service, and that
              your submission does not violate law or third-party rights.
            </p>
          </Section>

          <Section title="5. Downloads and your responsibilities">
            <p>
              PDF downloads are provided for personal, non-commercial educational use unless a specific resource states
              otherwise. You are responsible for how you use downloaded materials, including compliance with applicable
              copyright and licensing rules in your country.
            </p>
            <p>
              You understand that materials may be prepared or collected using various operational workflows (including
              community channels and manual curation). We do not guarantee completeness, accuracy, or suitability for any
              particular purpose.
            </p>
          </Section>

          <Section title="6. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </Section>

          <Section title="7. Limitation of liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS
              INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF
              (A) THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM (IF ANY), OR (B)
              INR 1,000, EXCEPT WHERE LIABILITY CANNOT BE LIMITED BY LAW.
            </p>
          </Section>

          <Section title="8. Indemnity">
            <p>
              You agree to indemnify and hold harmless The Opensource Library and its operators from claims, damages,
              losses, liabilities, and expenses (including reasonable legal fees) arising out of your misuse of the
              service, your submissions, or your violation of these Terms or applicable law, to the extent permitted by
              law.
            </p>
          </Section>

          <Section title="9. Suspension and termination">
            <p>
              We may suspend or terminate access to the service at any time, with or without notice, if we reasonably
              believe you violated these Terms, created risk, or if required for legal or operational reasons.
            </p>
          </Section>

          <Section title="10. Governing law and disputes">
            <p>
              These Terms are governed by the laws of India, without regard to conflict-of-law principles that would
              require applying another jurisdiction&apos;s laws. Subject to applicable law, courts located in India will
              have exclusive jurisdiction over disputes arising from or relating to these Terms or the service, unless
              a different mandatory forum applies for consumers.
            </p>
          </Section>

          <Section title="11. Changes">
            <p>
              We may update these Terms from time to time. The updated version will be posted on this page with a new
              &quot;Last updated&quot; date. Continued use after changes become effective constitutes acceptance of the
              revised Terms, to the extent permitted by law.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions about these Terms:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-bold hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>

          <div className="pt-4 flex flex-wrap gap-4 text-sm font-bold">
            <Link to="/privacy-policy" className="text-primary inline-flex items-center gap-2 hover:underline">
              <FileText size={16} />
              Privacy Policy
            </Link>
            <Link to="/" className="text-muted hover:text-primary">
              Back to home
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default TermsOfService;
