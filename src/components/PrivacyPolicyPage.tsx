import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe } from 'lucide-react';
import { NepalFlagWave } from './NepalFlagWave';
import { Language } from '../types';

const EFFECTIVE_DATE = 'August 24, 2026';
const CONTACT_EMAIL = 'ysunilkumar2030@gmail.com';

export const PrivacyPolicyPage: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('merotools_lang');
      if (saved === 'en' || saved === 'ne') return saved;
    } catch {}
    return 'en';
  });

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('merotools_theme');
      const isDark =
        savedTheme === 'dark' ||
        (savedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
    } catch {}
  }, []);

  const isNe = language === 'ne';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 p-1">
              <NepalFlagWave className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white truncate">
              {isNe ? 'मेरो टूल्स' : 'Mero Tools'}
            </span>
          </a>

          <button
            id="privacy-lang-toggle"
            onClick={() => setLanguage(isNe ? 'en' : 'ne')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors flex-shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{isNe ? 'English' : 'नेपाली'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isNe ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isNe ? 'लागू मिति: ' : 'Effective: '} {EFFECTIVE_DATE}
          </p>
        </div>

        {isNe ? (
          <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <Section title="सारांश">
              <p>
                <strong>मेरो टूल्स (Mero Tools)</strong> नेपालका लागि दैनिक क्यालकुलेटर तथा सूचना टूल्सको सङ्ग्रह हो। यो एप कुनै पनि प्रयोगकर्ता खाता, लगइन, वा व्यक्तिगत परिचय खुल्ने जानकारी बिना नै पूर्ण रूपमा प्रयोग गर्न मिल्छ। धेरैजसो गणनाहरू तपाईंको यन्त्रमै (अफलाइन) हुन्छन्।
              </p>
            </Section>

            <Section title="हामी के जानकारी सङ्कलन गर्दैनौं">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>नाम, इमेल, फोन नम्बर, वा कुनै व्यक्तिगत परिचय जानकारी</li>
                <li>खाता वा लगइन प्रणाली (कुनै पनि छैन)</li>
                <li>तपाईंले क्यालकुलेटरमा हालेको रकम, जन्म मिति, तलब, वा अन्य निजी अंकहरू — यी सबै तपाईंको यन्त्रबाहिर कहिल्यै पठाइँदैन</li>
                <li>विज्ञापन ट्र्याकिङ, एनालिटिक्स SDK, वा व्यवहार अनुगमन उपकरणहरू</li>
                <li>क्यामेरा, माइक्रोफोन, कन्ट्याक्ट, वा स्थान (location) पहुँच</li>
              </ul>
            </Section>

            <Section title="यन्त्रमै भण्डारण हुने जानकारी">
              <p>
                एपले तपाईंको भाषा र रङ्ग (Theme) प्राथमिकता, र विदेशी मुद्रा/सुनचाँदी दरको क्यास (कपी) मात्र तपाईंको यन्त्रको लोकल स्टोरेजमा राख्छ। यो डेटा कुनै सर्भरमा पठाइँदैन र कहिल्यै हामीसँग पुग्दैन। एप मेटाउँदा वा डेटा क्लियर गर्दा यो स्वतः हट्छ।
              </p>
            </Section>

            <Section title="तेस्रो-पक्ष स्रोतहरू">
              <p>
                विदेशी मुद्रा (Forex) टूल खोल्दा, तपाईंको यन्त्रले सिधै <strong>नेपाल राष्ट्र बैंक (NRB)</strong> को सार्वजनिक API बाट ताजा दर लिन्छ। यो सिधा सम्पर्कमा तपाईंको यन्त्रको सामान्य नेटवर्क जानकारी (जस्तै IP ठेगाना) NRB लाई देखिन सक्छ, जुन तिनको आफ्नै नीति अनुसार हुन्छ — हामीसँग यो जानकारीमा कुनै पहुँच वा भण्डारण छैन। यदि यो अनुरोध असफल भयो भने, एपले पहिले नै भण्डारण गरिएको वा पूर्वनिर्धारित दर देखाउँछ।
              </p>
            </Section>

            <Section title="अनुमतिहरू (Permissions)">
              <p>
                एन्ड्रोइड संस्करणले केवल <strong>इन्टरनेट</strong> अनुमति माग्छ — सार्वजनिक दर जानकारी ल्याउनका लागि मात्र। अरू कुनै संवेदनशील अनुमति (क्यामेरा, माइक्रोफोन, स्थान, कन्ट्याक्ट) माग्दैन।
              </p>
            </Section>

            <Section title="बालबालिकाको गोपनीयता">
              <p>यो एप बालबालिकालाई लक्षित गरिएको होइन। हामी जानीजानी बालबालिकाबाट कुनै व्यक्तिगत जानकारी सङ्कलन गर्दैनौं — किनभने हामी सुरुमै कसैको पनि व्यक्तिगत जानकारी सङ्कलन गर्दैनौं।</p>
            </Section>

            <Section title="नीति परिवर्तन">
              <p>यो नीति भविष्यमा अद्यावधिक हुन सक्छ। महत्त्वपूर्ण परिवर्तनहरू यसै पृष्ठमा नयाँ लागू मितिसहित अपडेट गरिनेछ।</p>
            </Section>

            <Section title="सम्पर्क">
              <p>
                यस नीतिसम्बन्धी कुनै प्रश्न भएमा सम्पर्क गर्नुहोस्: <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-600 dark:text-red-400 font-semibold underline">{CONTACT_EMAIL}</a>
              </p>
            </Section>
          </div>
        ) : (
          <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <Section title="Overview">
              <p>
                <strong>Mero Tools</strong> is a collection of everyday calculators and information tools for Nepal. The app works fully without any account, login, or personal identification. Most calculations run entirely on your own device.
              </p>
            </Section>

            <Section title="Information We Do Not Collect">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your name, email, phone number, or any personal identifying information</li>
                <li>Accounts or logins — there are none</li>
                <li>Values you enter into calculators (amounts, birth dates, salary figures, etc.) — these never leave your device</li>
                <li>Advertising trackers, analytics SDKs, or behavioral monitoring</li>
                <li>Camera, microphone, contacts, or location access</li>
              </ul>
            </Section>

            <Section title="Information Stored On Your Device">
              <p>
                The app stores your language and theme preference, plus a cached copy of foreign-exchange and gold/silver rates, in your device's local storage only. This data is never transmitted to us or any server we control. Uninstalling the app or clearing its data removes it completely.
              </p>
            </Section>

            <Section title="Third-Party Sources">
              <p>
                When you open the Forex tool, your device contacts <strong>Nepal Rastra Bank (NRB)</strong>'s public rate API directly to fetch current exchange rates. As with any direct network request, standard connection metadata (such as your IP address) may be visible to NRB under their own policies — we have no access to or storage of this information ourselves. If that request fails, the app falls back to a previously cached or default rate.
              </p>
            </Section>

            <Section title="Permissions">
              <p>
                The Android app requests only the <strong>Internet</strong> permission, used solely to fetch public rate data. It does not request camera, microphone, location, or contacts access.
              </p>
            </Section>

            <Section title="Children's Privacy">
              <p>This app is not directed at children and we do not knowingly collect personal information from anyone — children included, since we do not collect personal information from any user.</p>
            </Section>

            <Section title="Changes to This Policy">
              <p>This policy may be updated occasionally. Material changes will be reflected on this page with a new effective date.</p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about this policy can be sent to: <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-600 dark:text-red-400 font-semibold underline">{CONTACT_EMAIL}</a>
              </p>
            </Section>
          </div>
        )}

        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
          >
            {isNe ? '← एपमा फर्कनुहोस्' : '← Back to App'}
          </a>
        </div>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{title}</h2>
    {children}
  </section>
);
