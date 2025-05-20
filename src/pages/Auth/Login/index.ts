import LoginPresenter from './presenter';

import * as STORY_API from '../../../data/api';
import * as AUTH_MODEL from '../../../utils/auth';
import { useToast } from '../../../utils/toast';

export default class LoginPage {
  #presenter = null as LoginPresenter | null;

  async render() {
    return `
    <section class="container h-[90svh] flex items-center flex-col justify-center">
        <h1 class="text-4xl mb-8">Masuk</h1>
        <form id="login-form" class="flex flex-col gap-4 w-full max-w-sm ">  
            <div class="flex flex-col gap-2">
                <label for="email">Email <span class="text-red-600">*</span></label>
                <input type="email" id="email" name="email" placeholder="Email" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password <span class="text-red-600">*</span></label>
                <input type="password" id="password" name="password" placeholder="Password" class="input-custom" required />
            </div>
            <div id="submit-button-container" >
                <button class="button-custom w-full" type="submit">Login</button>
            </div>
        </form>
    </section>
          `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: STORY_API,
      authModel: AUTH_MODEL,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('login-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        email: (document.getElementById('email') as HTMLInputElement)?.value,
        password: (document.getElementById('password') as HTMLInputElement)?.value,
      };
      await this.#presenter?.getLogin(data);
    });
  }

  loginFailed(message: string) {
    useToast(message, 'error');
  }

  loginSuccessfully(message: string) {
    useToast(message, 'success');

    location.href = '/';
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit" disabled>
                <i class="fas fa-spinner animate-spin"></i> Login
            </button>
        `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit">Login</button>
        `;
    }
  }
}
