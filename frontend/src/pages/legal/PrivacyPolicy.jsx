import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield } from 'lucide-react';

const LAST_UPDATED = 'April 11, 2026';
const CONTACT_EMAIL = 'pixelnodecorporations@gmail.com';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-black text-heading tracking-tight">{title}</h2>
    <div className="text-muted text-sm sm:text-base leading-relaxed space-y-3 font-medium">{children}</div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="pt-28 pb-24 px-6 min-h-screen relative overflow-hidden">
      <div className="absolute -top-[10%] right-0 w-[45%] h-[45%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Shield size={16} className="text-primary" />
            <span className="text-primary text-xs font-black uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-heading tracking-tighter">Privacy Policy</h1>
          <p className="text-muted text-sm font-semibold">
            Last updated: {LAST_UPDATED} · The Opensource Library · India
          </p>
          <p className="text-muted text-sm leading-relaxed border-l-2 border-primary/40 pl-4">
            This page explains how we collect, use, store, and share information when you use our website and related
            features (including the newsletter, book requests, and downloads). It is written to reflect how the site
            works today and planned features (such as advertisements). It does not replace independent legal advice.
          </p>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-3xl p-8 md:p-10 border border-glass-border space-y-10"
        >
          <Section title="1. Who we are">
            <p>
              &quot;The Opensource Library&quot; (also referred to as &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              operates this website and related online services. For privacy-related questions or requests, contact us
              at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-bold hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. What information we collect">
            <p>
              <strong className="text-heading">Newsletter.</strong> When you subscribe to our newsletter, we collect
              your email address. We may also store verification-related data (for example, a one-time code and
              verification status) so we can confirm your subscription and reduce abuse. This information is stored in
              our database.
            </p>
            <p>
              <strong className="text-heading">Book requests.</strong> If you request a book, we collect the details you
              submit (including your email address, book title, and author name) so we can review and process the
              request. Book requests are only accepted from email addresses that match a verified newsletter
              subscription, as described on the request page.
            </p>
            <p>
              <strong className="text-heading">Downloads and browsing.</strong> When you browse the site or download PDF
              files, our servers and hosting infrastructure may automatically collect technical information such as IP
              address, device/browser type, approximate location derived from IP, timestamps, and pages or files
              accessed. We may also use cookies or similar technologies where needed for security, preferences, or
              analytics.
            </p>
            <p>
              <strong className="text-heading">Contributions and communications.</strong> If you contact us (for
              example by email or social channels) or submit content for publication, we collect the information you
              choose to provide.
            </p>
          </Section>

          <Section title="3. How we use your information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate, maintain, and improve the website and library catalog.</li>
              <li>To send newsletter messages and transactional emails (such as verification messages).</li>
              <li>To review and respond to book requests and community inquiries.</li>
              <li>To protect the service, prevent fraud and abuse, and enforce our terms.</li>
              <li>To comply with legal obligations and respond to lawful requests.</li>
              <li>
                To measure performance and understand how the site is used (including analytics, where enabled).
              </li>
              <li>
                To show advertisements if we enable them (see below), including measuring delivery and effectiveness.
              </li>
            </ul>
          </Section>

          <Section title="4. Advertising (current and future)">
            <p>
              The website may display advertisements now or in the future. Advertisers and ad networks may use cookies,
              pixels, SDKs, or similar technologies to show relevant ads, limit repetition, measure conversions, and
              perform fraud prevention. Those third parties may collect information according to their own privacy
              policies.
            </p>
            <p>
              Where required by law, we will seek appropriate consent for non-essential cookies or personalized
              advertising, and we will provide controls or disclosures consistent with applicable regulations.
            </p>
          </Section>

          <Section title="5. Legal bases (summary)">
            <p>
              Depending on applicable law, we rely on one or more of the following: your consent (for example, when you
              subscribe to the newsletter or accept optional cookies), performance of a service you request, legitimate
              interests (such as security, analytics at an aggregated level, and improving the site), and legal
              compliance.
            </p>
          </Section>

          <Section title="6. Sharing of information">
            <p>We may share information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-heading">Service providers</strong> who help us host the site, send email,
                process data, provide analytics, or deliver advertisements.
              </li>
              <li>
                <strong className="text-heading">Professional advisers</strong> where required (for example legal or
                accounting advisers), under confidentiality obligations.
              </li>
              <li>
                <strong className="text-heading">Authorities</strong> if we believe disclosure is required by law or
                necessary to protect rights, safety, or security.
              </li>
            </ul>
            <p>We do not sell your personal information as a standalone product.</p>
          </Section>

          <Section title="7. International transfers">
            <p>
              Our operations are based in India, but hosting, email, analytics, or ad partners may process data in other
              countries. Where required, we will use appropriate safeguards consistent with applicable law.
            </p>
          </Section>

          <Section title="8. Retention">
            <p>
              We keep information only as long as needed for the purposes described in this policy, including legal,
              accounting, and security needs. Newsletter and request records may be retained to operate the service and
              maintain an audit trail unless you ask for deletion where applicable law allows.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We use reasonable technical and organizational measures to protect information. No method of transmission
              or storage is completely secure; we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="10. Your choices and rights">
            <p>
              Depending on where you live, you may have rights to access, correct, delete, restrict, or object to
              certain processing, and to withdraw consent where processing is consent-based. You may also have the right
              to lodge a complaint with a supervisory authority. To exercise rights, contact us at the email above. We
              may need to verify your request.
            </p>
            <p>
              You can unsubscribe from marketing emails using the instructions in those emails, where available, or by
              contacting us.
            </p>
          </Section>

          <Section title="11. Children">
            <p>
              The service is not directed to children under 13 (or a higher age where required by local law). If you
              believe we collected information from a child inappropriately, contact us and we will take appropriate
              steps.
            </p>
          </Section>

          <Section title="12. Third-party links and content">
            <p>
              Our website may link to third-party websites, repositories, or social platforms. We also distribute PDF
              documents that may originate from community contributors or sourcing workflows. Third-party services and
              files are governed by their own terms and policies, and we are not responsible for their practices.
            </p>
          </Section>

          <Section title="13. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. We will post the updated version on this page and
              update the &quot;Last updated&quot; date. Material changes may be communicated through the website or
              email where appropriate.
            </p>
          </Section>

          <div className="pt-4 flex flex-wrap gap-4 text-sm font-bold">
            <Link to="/terms-of-service" className="text-primary inline-flex items-center gap-2 hover:underline">
              <FileText size={16} />
              Terms of Service
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

export default PrivacyPolicy;
