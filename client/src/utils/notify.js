import { Notify } from 'quasar'

export function notifySuccess(message) {
  Notify.create({
    message,
    color: 'green',
    position: 'bottom-right',
    timeout: 2000,
    icon: 'check_circle',
    type: 'positive',
  })
}

export function notifyError(message) {
  Notify.create({
    message,
    color: 'red',
    position: 'bottom-right',
    timeout: 2500,
    icon: 'error',
    type: 'negative',
  })
}
