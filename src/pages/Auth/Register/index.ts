import RegisterPresenter from './presenter';
import * as STORY_API from '../../../data/api';
import { useToast } from '../../../utils/toast';

export default class RegisterPage {
  #presenter = null as RegisterPresenter | null;

  async render() {
    return `
    <section class="container h-[90svh] flex items-center flex-col justify-center">
        <h1 class="text-4xl mb-8">Daftar</h1>
        <form id="register-form" class="flex flex-col gap-4 w-full max-w-sm ">  
            <div class="flex flex-col gap-2">
                <label for="name" >Name <span class="text-red-600">*</span></label>
                <input type="text" id="name" name="name" placeholder="Name" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="email">Email <span class="text-red-600">*</span></label>
                <input type="email" id="email" name="email" placeholder="Email" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password <span class="text-red-600">*</span></label>
                <input type="password" id="password" name="password" placeholder="Password" class="input-custom" required />
            </div>
            <div id="submit-button-container" >
                <button class="button-custom w-full" type="submit">Daftar akun</button>
            </div>
        </form>
    </section>
            `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: STORY_API,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('register-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        name: (document.getElementById('name') as HTMLInputElement)?.value,
        email: (document.getElementById('email') as HTMLInputElement)?.value,
        password: (document.getElementById('password') as HTMLInputElement)?.value,
      };
      await this.#presenter?.getRegistered(data);
    });
  }

  registeredSuccessfully(message: string) {
    useToast(message, 'success');

    location.hash = '/login';
  }

  registeredFailed(message: string) {
    useToast(message, 'error');
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="button-custom w-full" type="submit" disabled>
          <i class="fas fa-spinner animate-spin"></i> Daftar akun
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="button-custom w-full" type="submit">Daftar akun</button>
      `;
    }
  }
}
