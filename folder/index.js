  // ── COUPON LOGIC ──────────────────────────────────────────────────────────
  const COUPONS = {
    'NBC10':    { type: 'percent', value: 10, label: '10% off applied!' },
    'FIRSTSIP': { type: 'flat',    value: 30, label: '₹30 off applied!' },
    'NBCAPP':   { type: 'percent', value: 10, label: 'App discount applied! 🎉' },
  };

  let basePrice = 149;
  let deliveryFee = 29;
  let appliedDiscount = 0;

  function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    const msg = document.getElementById('couponMsg');

    if (!code) {
      msg.className = 'coupon-msg error';
      msg.innerHTML = '⚠️ Please enter a coupon code';
      return;
    }

    if (COUPONS[code]) {
      const c = COUPONS[code];
      if (c.type === 'percent') {
        appliedDiscount = Math.round(basePrice * c.value / 100);
      } else {
        appliedDiscount = c.value;
      }

      msg.className = 'coupon-msg success';
      msg.innerHTML = `✅ ${c.label} You save ₹${appliedDiscount}`;
      updateTotal();
    } else {
      appliedDiscount = 0;
      msg.className = 'coupon-msg error';
      msg.innerHTML = '❌ Invalid coupon code. Try NBC10 or FIRSTSIP';
      updateTotal();
    }
  }

  function useChip(code) {
    document.getElementById('couponInput').value = code;
    applyCoupon();
  }

  function updateTotal() {
    const total = basePrice + deliveryFee - appliedDiscount;
    document.getElementById('totalVal').textContent = `₹${total}`;
    document.getElementById('btnTotal').textContent = total;

    if (appliedDiscount > 0) {
      document.getElementById('discountRow').style.display = 'flex';
      document.getElementById('discountVal').textContent = `-₹${appliedDiscount}`;
    } else {
      document.getElementById('discountRow').style.display = 'none';
    }
  }

  // ── PAYMENT METHOD ────────────────────────────────────────────────────────
  function selectPay(el) {
    document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  }

  // ── PLACE ORDER ───────────────────────────────────────────────────────────
  function placeOrder() {
    const fname = document.getElementById('fname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const addr1 = document.getElementById('addr1').value.trim();
    const city  = document.getElementById('city').value.trim();
    const pin   = document.getElementById('pin').value.trim();

    if (!fname || !phone || !addr1 || !city || !pin) {
      alert('Please fill in all required address fields.');
      return;
    }

    if (pin.length !== 6 || isNaN(pin)) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    const orderId = 'NBC' + Date.now().toString().slice(-6);
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('successOverlay').classList.add('show');
  }