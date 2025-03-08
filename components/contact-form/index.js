import cn from 'clsx'
import { useForm } from 'react-hook-form'
import s from './contact-form.module.scss'

export function ContactForm({ onSubmit, className }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
  })

  return (
    <form className={cn(s.form, className)} onSubmit={handleSubmit(onSubmit)}>
      <div className={s.field}>
        <label htmlFor="name" className={s.label}>
          Jméno *
        </label>
        <input
          id="name"
          type="text"
          className={s.input}
          {...register('name', { required: 'Jméno je povinné' })}
        />
        {errors.name && <span className={s.error}>{errors.name.message}</span>}
      </div>

      <div className={s.field}>
        <label htmlFor="email" className={s.label}>
          Email *
        </label>
        <input
          id="email"
          type="email"
          className={s.input}
          {...register('email', {
            required: 'Email je povinný',
            pattern: {
              value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
              message: 'Prosím zadejte platný email',
            },
          })}
        />
        {errors.email && (
          <span className={s.error}>{errors.email.message}</span>
        )}
      </div>

      <div className={s.field}>
        <label htmlFor="message" className={s.label}>
          Zpráva
        </label>
        <textarea
          id="message"
          className={cn(s.input, s.textarea)}
          {...register('message')}
        />
      </div>

      <button
        type="submit"
        className={cn('button', s.button)}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Odesílání...' : 'Odeslat'}
      </button>
    </form>
  )
}
