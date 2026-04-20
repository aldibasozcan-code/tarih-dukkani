import { getState } from '../../store/store.js';
import { openModal } from '../../components/modal.js';
import { icon } from '../../components/icons.js';
import { formatCurrency, getLocalDateStr } from '../../utils/helpers.js';

export function openWeeklyPerformanceModal() {
  const state = getState();
  
  openModal({
    title: 'Haftalık Performans Detayı',
    body: renderPerformanceDetails(state),
    size: 'lg'
  });
}

function renderPerformanceDetails(state) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const dayShorts = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const now = new Date();
  
  // Calculate income for each day of current week
  const weekIncome = days.map((_, i) => {
    const d = new Date(now);
    // Find monday of this week
    const currentDay = d.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = d.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff + i);
    
    const dStr = getLocalDateStr(d);
    return state.transactions
      .filter(t => t.date === dStr && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  });

  const totalWeekly = weekIncome.reduce((a, b) => a + b, 0);
  const max = Math.max(...weekIncome, 100);

  return `
    <div class="performance-modal-content">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding:20px; background:var(--brand-green-soft); border-radius:16px;">
        <div>
          <div style="font-size:14px; color:var(--text-secondary); font-weight:600;">Bu Haftaki Toplam Kazanç</div>
          <div style="font-size:32px; font-weight:800; color:var(--brand-green); margin-top:4px;">${formatCurrency(totalWeekly)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px; color:var(--text-secondary); font-weight:600;">Ortalama Günlük</div>
          <div style="font-size:20px; font-weight:700; color:var(--brand-green); margin-top:4px;">${formatCurrency(totalWeekly / 7)}</div>
        </div>
      </div>

      <div style="height:300px; display:flex; align-items:flex-end; gap:16px; margin:40px 0; padding:20px; border-bottom:2px solid var(--border); position:relative;">
        <!-- Y-Axis Labels -->
        <div style="position:absolute; left:-40px; top:0; bottom:0; display:flex; flex-direction:column; justify-content:space-between; font-size:10px; color:var(--text-muted); padding-bottom:20px;">
          <span>${formatCurrency(max)}</span>
          <span>${formatCurrency(max / 2)}</span>
          <span>0</span>
        </div>

        ${weekIncome.map((val, i) => {
          const h = (val / max) * 100;
          const isToday = new Date().getDay() === (i + 1) % 7;
          
          return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:12px; height:100%; justify-content:flex-end;">
              <div style="font-size:12px; font-weight:700; color:var(--brand-green); opacity:${val > 0 ? 1 : 0};">${val > 0 ? formatCurrency(val) : ''}</div>
              <div class="hover-lift" style="width:100%; height:${Math.max(h, 2)}%; background:${isToday ? 'linear-gradient(to top, var(--brand-green), var(--brand-green-light))' : 'var(--brand-green-soft)'}; border-radius:8px; border:1px solid ${isToday ? 'var(--brand-green)' : 'var(--border)'}; transition:all 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
              <div style="font-size:13px; font-weight:700; color:${isToday ? 'var(--brand-green)' : 'var(--text-secondary)'};">${dayShorts[i]}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="performance-stats-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:24px;">
        <div style="padding:16px; border:1px solid var(--border); border-radius:12px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; background:rgba(16,185,129,0.1); color:var(--success); border-radius:10px; display:flex; align-items:center; justify-content:center;">
            ${icon('trendUp', 20)}
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">En Verimli Gün</div>
            <div style="font-size:16px; font-weight:700;">${days[weekIncome.indexOf(Math.max(...weekIncome))]}</div>
          </div>
        </div>

        <div style="padding:16px; border:1px solid var(--border); border-radius:12px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; background:rgba(124,106,255,0.1); color:var(--accent2 || '#7c3aed'); border-radius:10px; display:flex; align-items:center; justify-content:center;">
            ${icon('checkCircle', 20)}
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Aktif Ders Günleri</div>
            <div style="font-size:16px; font-weight:700;">${weekIncome.filter(v => v > 0).length} Gün</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
