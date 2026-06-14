import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'

const CONTACT = JSON.parse(import.meta.env.VITE_CONTACT);

export default function Footer({ onTry, currentStatus }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const year = new Date().getFullYear()

  const CONTACT = JSON.parse(import.meta.env.VITE_CONTACT);

  const goToSection = (id) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(scroll, 60)
    } else {
      scroll()
    }
  }

  const sections = [
    { id: 'services', label: t('nav.services') },
    { id: 'approach', label: t('nav.approach') },
    { id: 'pricing', label: t('nav.pricing') },
    { id: 'testimonials', label: t('nav.testimonials') },
    { id: 'contact', label: t('nav.contact') },
  ]

  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="container-narrow grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-extrabold text-amber-400">
              K
            </span>
            <span className="font-extrabold text-white">Khaleque IT Consulting</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-300">{t('footer.tagline')}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
            {t('footer.navTitle')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <button onClick={() => goToSection(s.id)} className="text-navy-200 hover:text-amber-400">
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
            {t('footer.legalTitle')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/impressum" className="text-navy-200 hover:text-amber-400">
                {t('footer.impressum')}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-navy-200 hover:text-amber-400">
                {t('footer.privacy')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
            {t('footer.contactTitle')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-200">
            <li>{CONTACT.city}</li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-amber-400">
                {CONTACT.email}
              </a>
            </li>
{/*            
            <li>
              <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`} className="hover:text-amber-400">
                {CONTACT.phone}
              </a>
            </li>
*/}            
          </ul>
        </div>        
      </div>
      <div className="container-narrow flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-400 sm:flex-row">
        <p>{t('nav.try')}&nbsp;&nbsp;{currentStatus && (<div>{t('contact.aiAssistantCall')}&nbsp;{CONTACT.sphone}</div>)}</p>
        <button className="btn-secondary disabled:opacity-60" onClick={onTry}>
          {t('nav.tryBut')}
        </button>        
      </div>      
      <div className="border-t border-white/10">
        <div className="container-narrow flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-400 sm:flex-row">
          <p>© {year} Khaleque IT Consulting. {t('footer.rights')}</p>          
          <p>Frankfurt am Main · Rhein-Main</p>
        </div>
      </div>
    </footer>
  )
}
