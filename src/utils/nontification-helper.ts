import { convertBase64ToUint8Array } from '.';
import { SUBSCRIPTION_KEY } from '../constants/config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
import { useToast } from './toast';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return await registration.pushManager.getSubscription();
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(SUBSCRIPTION_KEY),
  };
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    useToast('Sudah berlangganan push notification.', 'success');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      useToast('Service worker tidak terdaftar.', 'error');
      return;
    }
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();

    if (!endpoint) {
      throw new Error('Endpoint is undefined');
    }

    if (!keys || !('p256dh' in keys) || !('auth' in keys)) {
      throw new Error('Invalid keys in push subscription');
    }

    const response = await subscribePushNotification({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      useToast(failureSubscribeMessage, 'error');
      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();
      return;
    }

    useToast(successSubscribeMessage, 'success');
  } catch (error) {
    console.error('subscribe: error:', error);
    useToast(failureSubscribeMessage, 'error');
    if (pushSubscription) {
      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();

    if (!endpoint) {
      throw new Error('Endpoint is undefined');
    }
    if (!keys || !('p256dh' in keys) || !('auth' in keys)) {
      throw new Error('Invalid keys in push subscription');
    }

    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      alert(failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      await subscribePushNotification({
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
      return;
    }
    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}
