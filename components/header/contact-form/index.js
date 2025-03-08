import cn from 'clsx'
import { ContactForm as SimpleContactForm } from 'components/contact-form'
import { ScrollableBox } from 'components/scrollable-box'
import { Separator } from 'components/separator'
import { renderer as globalRenderer } from 'contentful/renderer'
import { useStore } from 'lib/store'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import s from './contact-form.module.scss'

export function ContactForm({ data }) {
  const menuRef = useRef(null)
  const router = useRouter()
  const { contact } = router.query
  const [contactIsOpen, setContactIsOpen, showThanks, setShowThanks] = useStore(
    (state) => [
      state.contactIsOpen,
      state.setContactIsOpen,
      state.showThanks,
      state.setShowThanks,
    ],
  )

  const closeContactTab = () => {
    setContactIsOpen(false)
    router.push({
      pathname: router.pathname,
      query: { confirm: true },
      shallow: true,
    })
    if (showThanks) setShowThanks(false)
  }

  useEffect(() => {
    const escFunction = (event) => {
      if (event.keyCode === 27) {
        closeContactTab()
      }
    }

    document.addEventListener('keydown', escFunction, false)
    return () => document.removeEventListener('keydown', escFunction, false)
  }, [])

  useEffect(() => {
    setContactIsOpen(contact)
  }, [contact])

  const handleSubmit = async (formData) => {
    try {
      // Here you can implement your own form submission logic
      // For example, sending to your backend API or email service
      console.log('Form submitted:', formData)

      // Show thank you message
      setShowThanks(true)

      // Optional: Close form after delay
      setTimeout(() => {
        closeContactTab()
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Došlo k chybě při odesílání formuláře. Prosím zkuste to znovu.')
    }
  }

  return (
    <div className={cn(s.container, contactIsOpen && s.open)}>
      <div className={s.overlay} onClick={closeContactTab} />
      <div className={cn(s.wrapper, contactIsOpen && s.open)} ref={menuRef}>
        <div className={s.heading}>
          <button className={cn('button', s.cta)} onClick={closeContactTab}>
            close
          </button>
          <Separator className={s.separator} />
        </div>
        {showThanks ? (
          <ScrollableBox className={s.scrollable} shadow={false}>
            <div className={s.content}>
              {globalRenderer(data.thankYouMessage)}
            </div>
          </ScrollableBox>
        ) : (
          <ScrollableBox className={s.scrollable} shadow={false}>
            <div className={s.content}>{globalRenderer(data.description)}</div>
            <SimpleContactForm onSubmit={handleSubmit} className={s.form} />
          </ScrollableBox>
        )}
      </div>
    </div>
  )
}
