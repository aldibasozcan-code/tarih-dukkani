import { icon } from '../components/icons.js';

export function renderTermsOfService(navigate) {
  return {
    html: `
      <div class="public-container">
        <div class="card glass fade-in" style="max-width: 900px; margin: 60px auto; padding: 60px; line-height: 1.8;">
          <div style="text-align: center; margin-bottom: 48px;">
            <div style="background: var(--brand-green-soft); color: var(--brand-green); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
              ${icon('book', 32)}
            </div>
            <h1 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 12px;">Kullanım Şartları</h1>
            <p style="color: var(--text-muted); font-weight: 600;">Son Güncelleme: 2 Nisan 2026</p>
          </div>

          <div class="terms-content" style="color: var(--text-primary);">
            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">1. Kabul</h2>
              <p>Bitig.app uygulamasını kullanarak bu şartları kabul etmiş sayılırsınız. Uygulama, öğretmenlerin ders planlaması ve içerik yönetimi yapması için tasarlanmıştır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">2. Kullanıcı Sorumluluğu</h2>
              <p>Platform üzerinden paylaştığınız her türlü içerik ve materyalin sorumluluğu size aittir. Telif hakkı ihlali içeren içeriklerin paylaşılması yasaktır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">3. Hizmet Sunumu</h2>
              <p>Uygulama, öğretmenlere yardımcı bir araç olup, hizmetlerin kesintisizliği garanti edilmez. Verilerinizin güvenliğini sağlamak için gerekli önlemler alınmıştır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">4. Google API Kullanımı</h2>
              <p>Uygulama içindeki Google Takvim entegrasyonu, sadece kullanıcıya takvim verilerini göstermek içindir. Kullanıcı istediği zaman bu entegrasyonu kaldırabilir.</p>
            </section>
          </div>

          <div style="margin-top: 48px; text-align: center; border-top: 1px solid var(--border); padding-top: 32px;">
            <button class="btn btn-primary" id="btn-home" style="border-radius: 100px; padding: 12px 32px;">Anasayfaya Dön</button>
          </div>
        </div>
      </div>
    `,
    init: (el, navigate) => {
      el.querySelector('#btn-home').addEventListener('click', () => navigate('home'));
    }
  };
}
