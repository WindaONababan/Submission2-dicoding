import {
  generateNavigationAuthenticated,
  generateNavigationUnauthenticated,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../components/templates';
import routes from '../constants/routes';
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { getActiveRoute } from '../utils/url-parser';
import { useToast } from '../utils/toast';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/nontification-helper';
import NotFoundPage from './NotFound';

type AppConstructor = {
  navigationDrawer: HTMLElement | null;
  drawerButton: HTMLElement | null;
  content: HTMLElement | null;
  skipContent: HTMLElement | null;
};

class App {
  #content: HTMLElement | null;
  #drawerButton: HTMLElement | null;
  #navigationDrawer: HTMLElement | null;
  #skipContent: HTMLElement | null;

  constructor({ navigationDrawer, drawerButton, content, skipContent }: AppConstructor) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipContent = skipContent;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipContent, this.#content);

    if (this.#navigationDrawer) {
      this.#navigationDrawer.setAttribute('aria-hidden', 'true');
    }

    if (this.#drawerButton) {
      this.#drawerButton.setAttribute('aria-expanded', 'false');
      this.#drawerButton.setAttribute('aria-controls', 'navigation-drawer');
    }

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton?.addEventListener('click', () => {
      this.#navigationDrawer?.classList.toggle('translate-x-full');
      this.#navigationDrawer?.classList.add('right-0');
      this.#navigationDrawer?.classList.remove('-right-[100%]');

      const isExpanded = !this.#navigationDrawer?.classList.contains('translate-x-full');
      this.#drawerButton?.setAttribute('aria-expanded', String(isExpanded));

      if (isExpanded) {
        this.#navigationDrawer?.setAttribute('aria-hidden', 'false');
      } else {
        this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
        this.#drawerButton?.focus();
      }
    });

    document.addEventListener('click', (e) => {
      const closeButton = document.getElementById('close-button');
      if (closeButton && e.target === closeButton) {
        this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
        this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
        this.#drawerButton?.setAttribute('aria-expanded', 'false');
        this.#drawerButton?.focus();
      }
    });

    document.body.addEventListener('click', (e: any) => {
      if (!this.#navigationDrawer?.contains(e.target) && !this.#drawerButton?.contains(e.target)) {
        this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
        this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
        this.#drawerButton?.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer?.querySelectorAll('a').forEach((link) => {
        if (link.contains(e.target)) {
          this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
          this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
          this.#drawerButton?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navigationDrawer = this.#navigationDrawer as HTMLElement;

    if (!isLogin) {
      navigationDrawer.innerHTML = generateNavigationUnauthenticated();
      return;
    }

    navigationDrawer.innerHTML = generateNavigationAuthenticated();

    const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;

    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        location.hash = '/login';
        useToast('Logout Berhasil', 'success');
      }
    });

    const focusableElements = this.#navigationDrawer?.querySelectorAll('a, button') || [];

    if (focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      lastElement.addEventListener('keydown', (event) => {
        if (event.key === 'Tab' && !event.shiftKey) {
          this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
          this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
          this.#drawerButton?.setAttribute('aria-expanded', 'false');
        }
      });

      const firstElement = focusableElements[0] as HTMLElement;

      firstElement.addEventListener('keydown', (event) => {
        if (event.key === 'Tab' && event.shiftKey) {
          this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
          this.#navigationDrawer?.setAttribute('aria-hidden', 'true');
          this.#drawerButton?.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  async #setupPushNotification() {
    const pushNotificationButton = document.getElementById(
      'action-push-notification',
    ) as HTMLLIElement;
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationButton.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button')?.addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    pushNotificationButton.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button')?.addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute() || '/';

    const routeExists = url && routes[url as keyof typeof routes];

    const page = routeExists ? routes[url as keyof typeof routes]() : new NotFoundPage();

    const transition = transitionHelper({
      updateDOM: async () => {
        if (this.#content) {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
