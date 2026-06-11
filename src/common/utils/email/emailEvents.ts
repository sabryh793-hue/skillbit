import EventEmitter from 'events'
import { sendEmail } from './send-email'


export enum EMAIL_EVENTS_ENUM {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  SEND_EMAIL = 'SEND_EMAIL',
}

export class EmailEvents {
  constructor(private readonly emitter: EventEmitter) {}

  subscribe = (event: EMAIL_EVENTS_ENUM, callback: (payload: any) => void) => {
    this.emitter.on(event, callback)
  }

  publish = (event: EMAIL_EVENTS_ENUM, payload: any) => {
    this.emitter.emit(event, payload)
  }
}

const emitter = new EventEmitter()
export const emailEmitter = new EmailEvents(emitter)

emailEmitter.subscribe(
  EMAIL_EVENTS_ENUM.VERIFY_EMAIL,
  ({
    to,
    subject,
    html,
  }: {
    to: 'hagersabry12789@gmail.com'
    subject: string
    html: string
  }) => {
    sendEmail({ to, subject, html })
  },
)
emailEmitter.subscribe(
  EMAIL_EVENTS_ENUM.RESET_PASSWORD,
  ({
    to,
    subject,
    html,
  }: {
    to: 'hagersabry12789@gmail.com'
    subject: string
    html: string
  }) => {
    sendEmail({ to, subject, html })
  },
)
emailEmitter.subscribe(
  EMAIL_EVENTS_ENUM.SEND_EMAIL,
  ({
    to,
    subject,
    html,
  }: {
    to: 'hagersabry12789@gmail.com'
    subject: string
    html: string
  }) => {
    sendEmail({ to, subject, html })
  },
)