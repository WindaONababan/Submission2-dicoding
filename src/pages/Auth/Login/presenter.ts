interface LoginView {
  showSubmitLoadingButton(): void;
  hideSubmitLoadingButton(): void;
  loginFailed(message: string): void;
  loginSuccessfully(message: string): void;
}

export interface Root {
  error: boolean;
  message: string;
  loginResult: LoginResult;
  ok: boolean;
}

export interface LoginResult {
  userId: string;
  name: string;
  token: string;
}

interface LoginModel {
  getLogin(credentials: { email: string; password: string }): Promise<Root>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthModel {
  putAccessToken(accessToken: string): void;
}

export default class LoginPresenter {
  #view: LoginView;
  #model: LoginModel;
  #authModel: AuthModel;

  constructor({
    view,
    model,
    authModel,
  }: {
    view: LoginView;
    model: LoginModel;
    authModel: AuthModel;
  }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }: LoginCredentials): Promise<void> {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      this.#authModel.putAccessToken(response.loginResult.token);

      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed((error as Error).message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
