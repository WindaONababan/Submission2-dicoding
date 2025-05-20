export default class NotFoundPage {
  async render() {
    return `
      <section class="container mt-24 h-[74svh] mb-20 flex flex-col items-center justify-center">
        <div class="text-center">
          <h1 class="text-6xl md:text-8xl font-black mb-4">404</h1>
          <h2 class="text-2xl md:text-3xl font-bold mb-4">Halaman Tidak Ditemukan!</h2>
          <p class="text-lg mb-8">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
          <a href="#/" class="button-custom-neutral">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }
}
