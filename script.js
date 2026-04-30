// Progress bar
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progressBar').style.width = (scrollTop / docHeight * 100) + '%';

    // Show nav after cover
    const nav = document.getElementById('navbar');
    nav.classList.toggle('visible', scrollTop > window.innerHeight * 0.7);
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  // Tabs
  function showTab(id) {
    document.querySelectorAll('.benefit-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    event.target.classList.add('active');
  }
// ===== 50/30/20 Donut Chart =====
(function() {
  const R    = 80;
  const CIRC = 2 * Math.PI * R; // ~502.65
  const GAP  = 5;

  function fmt(n) {
    return n.toLocaleString('th-TH') + ' บาท';
  }

  // svg stroke-dashoffset trick:
  // Each circle starts at the top (rotate -90 in HTML).
  // dashoffset = CIRC - startAngle  (positive value pushes dash forward)
  // We position each arc by offsetting it so the visible dash starts right after the previous one.
  function setArc(el, startFraction, lengthFraction) {
    const arcLen    = CIRC * lengthFraction - GAP;
    const gapRest   = CIRC - arcLen;
    const offset    = CIRC * (1 - startFraction); // positive offset = rotate clockwise from top
    el.setAttribute('stroke-dasharray',  `${arcLen} ${gapRest}`);
    el.setAttribute('stroke-dashoffset', offset);
  }

  function updateDonut(income) {
    const arcN = document.getElementById('arc-necessary');
    const arcW = document.getElementById('arc-want');
    const arcS = document.getElementById('arc-save');
    if (!arcN) return;

    // 50% starts at 0, 30% starts at 0.5, 20% starts at 0.8
    setArc(arcN, 0,   0.5);
    setArc(arcW, 0.5, 0.3);
    setArc(arcS, 0.8, 0.2);

    document.getElementById('amt-necessary').textContent = fmt(income * 0.5);
    document.getElementById('amt-want').textContent      = fmt(income * 0.3);
    document.getElementById('amt-save').textContent      = fmt(income * 0.2);

    document.getElementById('donut-center-num').textContent   = income.toLocaleString('th-TH');
    document.getElementById('donut-center-label').textContent = 'บาท/เดือน';
  }

  const input = document.getElementById('incomeInput');
  if (input) {
    input.addEventListener('input', function() {
      const val = parseInt(this.value);
      if (val && val > 0) updateDonut(val);
    });
    updateDonut(18000);
    input.value = '18000';
  }
})();

// ===== Emergency Fund Calculator =====
(function() {
  const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                       'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  let targetMonths = 3;

  function fmt(n) { return n.toLocaleString('th-TH') + ' บาท'; }

  function getTargetDate(months) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return THAI_MONTHS[d.getMonth()] + ' ' + (d.getFullYear() + 543);
  }

  function getTip(months) {
    if (months <= 6)  return '🟢 ดีมาก! เป้าหมายนี้เป็นไปได้จริงภายในครึ่งปี';
    if (months <= 12) return '🟡 ใช้เวลาประมาณ 1 ปี ค่อยๆ ออมสม่ำเสมอได้เลย';
    if (months <= 24) return '🟠 ลองดูว่าตัดรายจ่ายเพิ่มได้อีกมั้ย เพื่อออมได้เร็วขึ้น';
    return '🔴 ลองปรับเพิ่มยอดออมต่อเดือน หรือลดเป้าเป็น 3 เดือนก่อน';
  }

  function calcEF() {
    const expense = parseFloat(document.getElementById('efExpense').value) || 0;
    const save    = parseFloat(document.getElementById('efSave').value)    || 0;

    const goal = expense * targetMonths;
    const efGoalEl   = document.getElementById('efGoal');
    const efMonthsEl = document.getElementById('efMonths');
    const efDateEl   = document.getElementById('efDate');
    const efBarEl    = document.getElementById('efBar');
    const efTipEl    = document.getElementById('efTip');

    if (!efGoalEl) return;

    if (goal === 0) {
      efGoalEl.textContent   = '—';
      efMonthsEl.textContent = '—';
      efDateEl.textContent   = '—';
      efBarEl.style.width    = '0%';
      efTipEl.textContent    = '';
      return;
    }

    efGoalEl.textContent = fmt(goal);

    if (save <= 0) {
      efMonthsEl.textContent = 'ยังไม่ได้ใส่ยอดออม';
      efDateEl.textContent   = '—';
      efBarEl.style.width    = '0%';
      efTipEl.textContent    = '💡 ลองตั้งเป้าออมอย่างน้อย 10% ของรายได้';
      return;
    }

    const months = Math.ceil(goal / save);
    // progress = what % of goal can be saved in targetMonths months
    const progressPct = Math.min(100, Math.round((save * targetMonths / goal) * 100));

    efMonthsEl.textContent = months + ' เดือน';
    efDateEl.textContent   = getTargetDate(months);
    efBarEl.style.width    = progressPct + '%';
    efTipEl.textContent    = getTip(months);
  }

  // month selector buttons
  document.querySelectorAll('.ef-month-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ef-month-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      targetMonths = parseInt(this.dataset.m);
      calcEF();
    });
  });

  ['efExpense', 'efSave'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcEF);
  });
})();