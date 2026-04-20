import { icon } from '../components/icons.js';

export function renderPrivacyPolicy(navigate) {
  return {
    html: `
      <div class="public-container">
        <div class="card glass fade-in" style="max-width: 900px; margin: 60px auto; padding: 60px; line-height: 1.8;">
          <div style="text-align: center; margin-bottom: 48px;">
            <div style="background: var(--brand-green-soft); color: var(--brand-green); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
              ${icon('shield', 32)}
            </div>
            <h1 style="font-size: 32px; font-weight: 800; color: var(--brand-green); margin-bottom: 12px;">Gizlilik Politikası</h1>
            <p style="color: var(--text-muted); font-weight: 600;">Son Güncelleme: 2 Nisan 2026</p>
          </div>

          <div class="privacy-content" style="color: var(--text-primary);">
            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">1. Giriş</h2>
              <p>Bitig.app olarak gizliliğinize büyük önem veriyoruz. Bu Gizlilik Politikası, uygulamamızı kullandığınızda verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar. Uygulamamız öğretmenler için dijital bir ajanda ve ders yönetim aracıdır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">2. Toplanan Bilgiler</h2>
              <p>Uygulama işlevselliği için sadece kayıt sırasında verdiğiniz e-posta adresi ve belirlediğiniz profil ismi sistemimizde saklanır. Ders içerikleri, öğrenci listeleri, takvim kayıtlarınız ve notlarınız Firebase veri tabanında güvenli bir şekilde depolanır. Tüm verileriniz sadece sizin erişiminize açıktır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">3. Güvenlik</h2>
              <p>Verileriniz endüstri standardı şifreleme yöntemleri ile korunmaktadır. Hesabınıza erişim Google Auth veya e-posta/şifre yöntemiyle güvenli bir şekilde sağlanır.</p>
            </section>

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: var(--brand-green); border-bottom: 2px solid var(--brand-green-soft); padding-bottom: 8px; margin-bottom: 16px;">4. İletişim</h2>
              <p>Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz: <strong>aldibasozcan@gmail.com</strong></p>
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
