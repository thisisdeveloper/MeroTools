import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe } from 'lucide-react';
import { NepalFlagWave } from './NepalFlagWave';
import { Language } from '../types';

const EFFECTIVE_DATE = 'September 7, 2026';
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
                <li>तल "विज्ञापन" मा उल्लेख गरिएकोबाहेक अन्य व्यवहार विश्लेषण वा प्रयोग-ट्र्याकिङ SDK</li>
                <li>क्यामेरा, माइक्रोफोन, वा कन्ट्याक्ट पहुँच</li>
              </ul>
            </Section>

            <Section title="यन्त्रमै भण्डारण हुने जानकारी">
              <p>
                एपले तपाईंको भाषा र रङ्ग (Theme) प्राथमिकता, विदेशी मुद्रा/सुनचाँदी दरको क्यास (कपी), र तपाईंले Reminders वा Shopping List प्रयोग गर्नुभयो भने तपाईंले बनाएका रिमाइन्डर, किनमेल सूची, र Location Reminder का विवरणहरू — यी सबै तपाईंको यन्त्रको लोकल स्टोरेजमा मात्र राख्छ। यो डेटा कुनै सर्भरमा पठाइँदैन र कहिल्यै हामीसँग पुग्दैन। एप मेटाउँदा वा डेटा क्लियर गर्दा यो स्वतः हट्छ।
              </p>
            </Section>

            <Section title="Location Reminder (ऐच्छिक)">
              <p>
                Reminders मा एउटा ऐच्छिक Location प्रकार छ, जसले तपाईं कुनै छानिएको ठाउँमा पुग्दा वा त्यहाँबाट निस्कँदा सूचित गर्छ। तपाईंले Location Reminder थप्नुभयो भने मात्र यो सुविधा सक्रिय हुन्छ — एपले अन्यथा वा एप खोल्दा नै तपाईंको स्थान कहिल्यै पहुँच गर्दैन।
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>एपले पहिले "प्रयोग गर्दा मात्र" (While Using) स्थान अनुमति माग्छ, त्यसपछि छुट्टै रूपमा "सधैं" (Always) अनुमतिमा अपग्रेड गर्न माग्छ — किनभने एप बन्द भएको बेला पनि रिमाइन्डरले सूचित गर्न सकोस् भन्नका लागि यो आवश्यक हुन्छ। तपाईं कुनै पनि अनुरोध अस्वीकार गर्न सक्नुहुन्छ; त्यसो गर्नुभयो भने यो सुविधा मात्र काम गर्दैन।</li>
                <li>तपाईंले बचत गर्नुभएका Location Reminder हरू (ठाउँ, दायरा, र आइपुग्ने/छोड्ने सेटिङ) अरू सबै रिमाइन्डर जस्तै तपाईंको यन्त्रको लोकल स्टोरेजमा मात्र राखिन्छन्। हामी यो डेटा कुनै सर्भरमा प्राप्त, हेर्न, वा भण्डारण गर्दैनौं।</li>
                <li>रिमाइन्डर ट्रिगर आफैं पूर्ण रूपमा iOS/Android को on-device स्थान सेवाद्वारा हुन्छ — यसका लागि तपाईंको वास्तविक-समयको स्थान हामी वा कुनै तेस्रो-पक्षलाई कहिल्यै पठाइँदैन।</li>
                <li>ठाउँ खोज्दा, वा खोजाइले फेला नपारेमा नक्सामा पिन थोपार्दा, तपाईंको खोज पाठ वा पिनको निर्देशांक (coordinates) हाम्रो ब्याकइन्डमा पठाइन्छ, जसले Google Places वा OpenStreetMap लाई अनुरोध पठाउँछ (तल "तेस्रो-पक्ष स्रोतहरू" हेर्नुहोस्) — यो केवल तपाईंले सक्रिय रूपमा खोज्दा वा पिन थोपार्दा मात्र हुन्छ, र परिणामहरू कुनै व्यक्तिगत परिचयसँग जोडिँदैनन् वा पछि हामीले भण्डारण गर्दैनौं।</li>
              </ul>
            </Section>

            <Section title="विज्ञापन">
              <p>
                एपले कहिलेकाहीँ कुनै टूल बन्द गरेर सूचीमा फर्कँदा (Settings मा होइन) <strong>Google AdMob</strong> बाट आउने पूर्ण-स्क्रिन विज्ञापन देखाउन सक्छ — बारम्बार होइन, केवल केही समयको प्रयोगपछि र कम्तीमा केही मिनेटको फरकमा मात्र। AdMob को SDK ले विज्ञापन देखाउन र मापन गर्न, र तपाईंले अस्वीकार नगरेसम्म व्यक्तिगत बनाउन यन्त्र पहिचानकर्ता (जस्तै तपाईंको यन्त्रको advertising ID, वा iOS मा IDFA) र सामान्य प्राविधिक डेटा (एप संस्करण, यन्त्र मोडेल, देश/क्षेत्र जस्तो नजिकको स्थान) सङ्कलन गर्न सक्छ। iOS मा, कुनै पनि पहिचानकर्ता व्यक्तिगत विज्ञापनका लागि प्रयोग हुनुअघि एपले App Tracking Transparency अनुमति माग्नेछ — अस्वीकार गर्दा पनि विज्ञापन देखिन्छ, फरक यत्ति हो कि कम लक्षित हुन्छ। Android मा, तपाईं आफ्नो यन्त्रको Google Settings बाट advertising ID रिसेट वा व्यक्तिगत विज्ञापनबाट अप्ट-आउट गर्न सक्नुहुन्छ। AdMob ले यो डेटा कसरी ह्यान्डल गर्छ भनेर Google को आफ्नै गोपनीयता नीति हेर्नुहोस्: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 font-semibold underline">policies.google.com/privacy</a>।
              </p>
            </Section>

            <Section title="तेस्रो-पक्ष स्रोतहरू">
              <p>
                विदेशी मुद्रा (Forex) टूल खोल्दा, तपाईंको यन्त्रले सिधै <strong>नेपाल राष्ट्र बैंक (NRB)</strong> को सार्वजनिक API बाट ताजा दर लिन्छ। यो सिधा सम्पर्कमा तपाईंको यन्त्रको सामान्य नेटवर्क जानकारी (जस्तै IP ठेगाना) NRB लाई देखिन सक्छ, जुन तिनको आफ्नै नीति अनुसार हुन्छ — हामीसँग यो जानकारीमा कुनै पहुँच वा भण्डारण छैन। यदि यो अनुरोध असफल भयो भने, एपले पहिले नै भण्डारण गरिएको वा पूर्वनिर्धारित दर देखाउँछ।
              </p>
              <p className="mt-2">
                Location Reminder मा ठाउँ खोज्दा वा पिन थोपार्दा, तपाईंको यन्त्रले खोज पाठ वा पिनको निर्देशांक हाम्रो ब्याकइन्डमा पठाउँछ, जसले मिल्दोजुल्दो परिणाम फेला पार्न <strong>Google Places</strong> र/वा <strong>OpenStreetMap को Nominatim</strong> सेवामा अनुरोध गर्छ, अनि परिणाम एपमा फिर्ता ल्याउँछ। यी सेवा प्रदायकहरूलाई तिनको आफ्नै नीति अनुसार सामान्य नेटवर्क जानकारी देखिन सक्छ। अनुरोध पूरा गर्न र दुरुपयोग रोक्न छोटो-अवधिको दर-सीमा लगाउनुबाहेक, हामी यी खोजहरू लग वा भण्डारण गर्दैनौं।
              </p>
            </Section>

            <Section title="अनुमतिहरू (Permissions)">
              <p>
                एन्ड्रोइड संस्करणले सार्वजनिक दर जानकारी, ठाउँ खोज सुविधा, र विज्ञापन देखाउनका लागि <strong>इन्टरनेट</strong> अनुमति माग्छ। तपाईंले Location Reminder प्रयोग गर्नुभयो भने, यसले थप <strong>स्थान</strong> (foreground र background) र <strong>notification</strong> अनुमति पनि माग्छ — यो अनुमति तपाईंले Location Reminder थप्दा मात्र माग्छ, एप खोल्दा कहिल्यै होइन, र अरू कुनै सुविधाका लागि पनि होइन। एपले क्यामेरा, माइक्रोफोन, वा कन्ट्याक्ट पहुँच माग्दैन।
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
                <li>Behavioral analytics or usage-tracking SDKs beyond what's described in "Advertising" below</li>
                <li>Camera, microphone, or contacts access</li>
              </ul>
            </Section>

            <Section title="Information Stored On Your Device">
              <p>
                The app stores your language and theme preference, a cached copy of foreign-exchange and gold/silver rates, and — if you use Reminders or the Shopping List — the reminders, shopping lists, and Location Reminder details you create, all in your device's local storage only. This data is never transmitted to us or any server we control. Uninstalling the app or clearing its data removes it completely.
              </p>
            </Section>

            <Section title="Location Reminders (Optional)">
              <p>
                Reminders includes an optional Location type that notifies you on arriving at or leaving a place you choose. This feature only activates if you add a location reminder — the app never accesses your location otherwise, and never on app launch.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>The app asks for "While Using" location access first, then separately asks to upgrade to "Always" access — needed so the reminder can still notify you when the app isn't open. You can decline either prompt; the feature simply won't work without it.</li>
                <li>Your saved location reminders (the place, radius, and arrive/leave setting) are stored only in your device's local storage, matching every other reminder type. We do not receive, see, or store this data on any server.</li>
                <li>The reminder trigger itself is handled entirely by iOS/Android's on-device location services — your real-time location is never sent to us or to any third party for this purpose.</li>
                <li>Searching for a place, or dropping a pin on the in-app map when search doesn't find it, does send your search text or the pin's coordinates to our backend, which forwards the request to Google Places or OpenStreetMap (see "Third-Party Sources" below) purely to return matching places or a place name — this happens only when you actively search or drop a pin, and results aren't linked to any personal identifier or stored by us afterward.</li>
              </ul>
            </Section>

            <Section title="Advertising">
              <p>
                The app may occasionally show a full-screen ad served by <strong>Google AdMob</strong> when you close a tool and return to the list (never on Settings) — not often, only after some active use and never more than once every few minutes. AdMob's SDK can collect device identifiers (such as your device's advertising ID, or IDFA on iOS) and general technical data (app version, device model, coarse location such as country/region) to serve and measure ads, and to personalize them unless you opt out. On iOS, the app will ask for App Tracking Transparency permission before any identifier is used for personalized ads — declining still shows ads, just less targeted. On Android, you can reset or opt out of ad personalization for your advertising ID in your device's Google Settings. See Google's own privacy policy for how AdMob handles this data: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 font-semibold underline">policies.google.com/privacy</a>.
              </p>
            </Section>

            <Section title="Third-Party Sources">
              <p>
                When you open the Forex tool, your device contacts <strong>Nepal Rastra Bank (NRB)</strong>'s public rate API directly to fetch current exchange rates. As with any direct network request, standard connection metadata (such as your IP address) may be visible to NRB under their own policies — we have no access to or storage of this information ourselves. If that request fails, the app falls back to a previously cached or default rate.
              </p>
              <p className="mt-2">
                When you search for a place or drop a pin in Location Reminders, your device sends the search text or pinned coordinates to our backend, which queries <strong>Google Places</strong> and/or <strong>OpenStreetMap's Nominatim</strong> service to find matching results, and returns them to the app. Standard connection metadata may be visible to those providers under their own policies. We do not log or retain these queries beyond what's needed to serve the request and apply a short-lived rate limit against abuse.
              </p>
            </Section>

            <Section title="Permissions">
              <p>
                The Android app requests the <strong>Internet</strong> permission to fetch public rate data, power place search, and show ads. If you use Location Reminders, it additionally requests <strong>location</strong> (foreground and background) and <strong>notification</strong> permissions, each requested only when you add a location reminder — never on app launch, and never for any other feature. The app does not request camera, microphone, or contacts access.
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
