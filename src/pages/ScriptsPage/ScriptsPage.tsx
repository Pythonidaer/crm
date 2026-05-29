import { Card, Text } from '@pythonidaer/ui'
import styles from './ScriptsPage.module.css'

interface ScriptCardProps {
  title: string
  children: React.ReactNode
}

function ScriptCard({ title, children }: ScriptCardProps) {
  return (
    <Card variant="bordered" padding="lg">
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.cardBody}>{children}</div>
    </Card>
  )
}

const QUALIFICATION_QUESTIONS = [
  'Do you currently have someone maintaining your website?',
  'Are you happy with how your site looks and works on mobile?',
  'Do customers usually find you through Google, referrals, social media, or something else?',
  'Have you ever had an accessibility review done?',
  'Is updating the website currently easy or annoying?',
  'Would it be useful if I sent over 2–3 practical improvements I notice?',
]

export function ScriptsPage() {
  return (
    <div className={styles.page}>
      <Text as="h1" variant="h3" className={styles.pageTitle}>Call Scripts</Text>
      <p className={styles.subtitle}>
        Use these scripts during cold outreach calls. Keep it conversational — don't read word for word.
      </p>

      <div className={styles.grid}>
        <ScriptCard title="Opening">
          <p className={styles.script}>
            "Hi, my name is Johnny. I'm a local web developer putting together a list of Salem-area
            businesses that may need help with websites, accessibility, SEO, or getting found better
            online. I'm not calling to hard-sell you. I'm just checking:{' '}
            <strong>who handles your website or online presence?</strong>"
          </p>
        </ScriptCard>

        <ScriptCard title="Qualification Questions">
          <ol className={styles.list}>
            {QUALIFICATION_QUESTIONS.map((q, i) => (
              <li key={i} className={styles.listItem}>{q}</li>
            ))}
          </ol>
        </ScriptCard>

        <ScriptCard title="Service Positioning">
          <p className={styles.script}>
            "I help small businesses improve their websites, make them easier to use, clean up
            confusing pages, improve local search visibility, and make sure the site works better
            for real customers."
          </p>
        </ScriptCard>

        <ScriptCard title="Follow-Up Close">
          <p className={styles.script}>
            "If it's helpful, I can do a quick review and send a short list of practical
            improvements. No pressure."
          </p>
        </ScriptCard>

        <ScriptCard title="Services Reference">
          <ul className={styles.list}>
            <li className={styles.listItem}><strong>Website redesign</strong> — mobile-first, accessible, fast</li>
            <li className={styles.listItem}><strong>Accessibility audit</strong> — WCAG 2.1 AA compliance review</li>
            <li className={styles.listItem}><strong>SEO</strong> — local search visibility, on-page optimization</li>
            <li className={styles.listItem}><strong>AEO</strong> — AI engine optimization, structured data, featured snippets</li>
            <li className={styles.listItem}><strong>Content cleanup</strong> — clear copy, removed confusion, better UX</li>
            <li className={styles.listItem}><strong>Site review</strong> — free 2–3 improvement summary to open the conversation</li>
          </ul>
        </ScriptCard>

        <ScriptCard title="Voicemail">
          <p className={styles.script}>
            "Hi, this is Johnny — I'm a local web developer in Salem. I was calling because I noticed
            your business while doing research on Salem-area companies and I had a couple of ideas
            that might be useful for your online presence. No pressure at all — if you're curious,
            feel free to call me back at [your number]. Thanks!"
          </p>
        </ScriptCard>
      </div>
    </div>
  )
}
