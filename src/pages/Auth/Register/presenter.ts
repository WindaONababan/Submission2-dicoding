interface RegisterView {
  showSubmitLoadingButton(): void;
  hideSubmitLoadingButton(): void;
  registeredFailed(message: string): void;
  registeredSuccessfully(message: string): void;
}

interface RegisterModel {
  getRegistered(credentials: { name: string; email: string; password: string }): Promise<{
    ok: boolean;
    message: string;
  }>;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export default class RegisterPresenter {
  #view: RegisterView;
  #model: RegisterModel;

  constructor({ view, model }: { view: RegisterView; model: RegisterModel }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }: RegisterCredentials): Promise<void> {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getRegistered({ name, email, password });

      if (!response.ok) {
        console.error('getRegistered: response:', response);
        this.#view.registeredFailed(response.message);
        return;
      }

      this.#view.registeredSuccessfully(response.message);
    } catch (error) {
      console.error('getRegistered: error:', error);
      this.#view.registeredFailed((error as Error).message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
