import React, { useState, useEffect } from 'react';

// Google Apps Script 배포 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAv-J8yX3Fll8OWgfTfrcgBsQlcZxrF8XpwNrr34Q1NIKO8ZEaTA3_s8cUIX8LtKD0/exec';

// 상품 데이터 (restricted: true → KFD/KLC 수료번호에 비노출)
const PRODUCTS = {
  pigments: [
    { code: 'PIG-Z.BR',  name: 'Z브라운 색소 / Z-Brown',               spec: '10g',          price: 7000 },
    { code: 'PWD-Z.BR',  name: 'Z브라운 색소 분말 / Z-Brown Powder',    spec: '10g, 분말',    price: 9000 },
    { code: 'PIG-X.RD',  name: 'X레드 색소 / X-Red',                   spec: '10g',          price: 5000 },
    { code: 'PIG-Z.RD',  name: 'Z레드 색소 / Z-Red',                   spec: '10g, 립 전용', price: 9000 },
    { code: 'PIG-YL',    name: '옐로우 색소 / Yellow',                  spec: '10g',          price: 5000 },
    { code: 'PIG-WT',    name: '화이트 색소 / White',                   spec: '10g',          price: 4500 },
    { code: 'PIG-WT.2',  name: '화이트 색소 2개 묶음 / White ×2 Set',  spec: '10g×2',        price: 8000 },
    { code: 'PIG-VT',    name: '바이올렛 색소 / Violet',                spec: '10g',          price: 6000 },
    { code: 'PIG-BK',    name: '블랙 색소 / Black',                     spec: '5g',           price: 3000 },
    { code: 'PIG-BL',    name: '블루 색소 / Blue',                      spec: '5g',           price: 3000,  restricted: true },
    { code: 'PIG-OR',    name: '오렌지 색소 / Orange',                  spec: '10g, 립 전용', price: 5000,  restricted: true },
    { code: 'PIG-MG',    name: '마젠타 색소 / Magenta',                 spec: '10g, 립 전용', price: 5000,  restricted: true },
  ],
  binders: [
    { code: 'BND-FND',   name: '파운데이션 바인더 / Foundation Binder',             spec: '100g',      price: 23000 },
    { code: 'BND-FND.L', name: '파운데이션 바인더 대용량 / Foundation Binder (1kg)', spec: '1kg',       price: 200000 },
    { code: 'PWD-MAT',   name: '매트 파우더 / Matte Powder',                        spec: '100g, 분말', price: 15000, restricted: true },
    { code: 'BND-LIP',   name: '립글로스 바인더 / Lip Gloss Binder',                spec: '50g',       price: 3000,  restricted: true },
  ],
  cards: [
    { code: 'CARD-SK5',   name: '진단카드(스킨용)*5 / Skin Diagnostic Card *5',              spec: '5개 묶음',  price: 10000 },
    { code: 'CARD-SK',    name: '진단카드(스킨용)*10 / Skin Diagnostic Card *10',             spec: '10개 묶음', price: 15000 },
    { code: 'CARD-LP5',   name: '진단카드(립용)*5 / Lip Diagnostic Card *5',                 spec: '5개 묶음',  price: 10000, restricted: true },
    { code: 'CARD-LP',    name: '진단카드(립용)*10 / Lip Diagnostic Card *10',                spec: '10개 묶음', price: 15000, restricted: true },
    { code: 'CARD-LC5',   name: '진단카드(립앤치크용)*5 / Lip & Cheek Diagnostic Card *5',   spec: '5개 묶음',  price: 10000 },
    { code: 'CARD-LC',    name: '진단카드(립앤치크용)*10 / Lip & Cheek Diagnostic Card *10',  spec: '10개 묶음', price: 15000 },
    { code: 'STCKR-SK5',  name: '진단스티커(스킨용)*5 / Skin Diagnostic Sticker *5',         spec: '5개 묶음',  price: 20000, restricted: true },
    { code: 'STCKR-SK',   name: '진단스티커(스킨용)*10 / Skin Diagnostic Sticker *10',        spec: '10개 묶음', price: 30000, restricted: true },
  ],
};

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + '-' + digits.slice(2);
    if (digits.length <= 9) return digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5);
    return digits.slice(0, 2) + '-' + digits.slice(2, 6) + '-' + digits.slice(6, 10);
  } else if (digits.startsWith('0')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return digits.slice(0, 3) + '-' + digits.slice(3);
    return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7, 11);
  }
  return digits;
}

function formatCertNum(raw) {
  raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  var prefixEnd = 0;
  for (var i = 1; i <= raw.length - 4; i++) {
    if (/^[0-9]{4}$/.test(raw.slice(i, i + 4))) {
      prefixEnd = i;
      break;
    }
  }
  if (prefixEnd === 0) return raw;
  var prefix = raw.slice(0, prefixEnd);
  var rest = raw.slice(prefixEnd);
  var year = rest.slice(0, 4);
  var seq = rest.slice(4, 7);
  if (seq.length > 0) return prefix + '-' + year + '-' + seq;
  if (year.length > 0) return prefix + '-' + year;
  return prefix;
}

export default function DCIOrderApp() {
  const [step, setStep] = useState('auth');
  const [fadeIn, setFadeIn] = useState(false);
  const [certNum, setCertNum] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticated, setAuthenticated] = useState(false); // eslint-disable-line no-unused-vars
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState(null);
  const [cart, setCart] = useState({});
  const [orderForm, setOrderForm] = useState({ email: '', phone: '', address: '', note: '' });
  const [orderComplete, setOrderComplete] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const loadInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const response = await fetch(
          GOOGLE_APPS_SCRIPT_URL + '?action=getInstructors',
          { method: 'GET' }
        );
        const result = await response.json();
        if (result.success) setInstructors(result.data);
        else setInstructors([]);
      } catch {
        setInstructors([]);
      }
      setLoadingInstructors(false);
    };
    loadInstructors();
  }, []);

  const handleAuth = () => {
    setAuthError('');
    const instructor = instructors.find(
      (inst) => inst.id === certNum.trim() && inst.name === instructorName.trim()
    );
    if (instructor) {
      setCurrentInstructor(instructor);
      setAuthenticated(true);
      setFadeIn(false);
      setStep('order');
      setTimeout(() => setFadeIn(true), 20);
    } else {
      setAuthError('수료번호 또는 강사명이 일치하지 않습니다.');
    }
  };

  const handleQuantityChange = (code, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[code];
      setCart(newCart);
    } else {
      setCart({ ...cart, [code]: quantity });
    }
  };

  const allProducts = [...PRODUCTS.pigments, ...PRODUCTS.binders, ...PRODUCTS.cards];

  // KFD 또는 KLC로 시작하는 수료번호는 restricted 제품 비노출
  const isKFDorKLC = currentInstructor &&
    (currentInstructor.id.startsWith('KFD') || currentInstructor.id.startsWith('KLC'));
  const filterItems = (items) => isKFDorKLC ? items.filter(p => !p.restricted) : items;

  const calculateTotal = () =>
    Object.entries(cart).reduce((total, [code, qty]) => {
      const product = allProducts.find((p) => p.code === code);
      return total + (product ? product.price * qty : 0);
    }, 0);

  const SHIPPING_FEE = 3000;
  const getTotalWithShipping = () => calculateTotal() + SHIPPING_FEE;

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([code, qty]) => {
      const product = allProducts.find((p) => p.code === code);
      return { ...product, quantity: qty, subtotal: product.price * qty };
    });

  const handleSubmitOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    const orderData = {
      order_id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('ko-KR'),
      instructor_id: currentInstructor.id,
      instructor_name: currentInstructor.name,
      instructor_email: currentInstructor.email,
      email: orderForm.email,
      phone: orderForm.phone,
      address: orderForm.address,
      note: orderForm.note,
      items: cartItems.map(({ code, name, spec, price, quantity, subtotal }) => ({
        code, name, spec, price, quantity, subtotal,
      })),
      subtotal: calculateTotal(),
      total: getTotalWithShipping(),
    };

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'processOrder', orderData }),
      });
      const result = await response.json();
      if (result.success) { setOrderComplete(true); setStep('confirm'); }
      else { alert('주문 처리 중 오류가 발생했습니다: ' + result.message); setSubmitting(false); }
    } catch {
      setOrderComplete(true);
      setStep('confirm');
    }
  };

  // 인증 화면
  if (step === 'auth') {
    return (
      <div style={styles.container}>
        <div style={styles.authBox}>
          <h1 style={styles.title}>DCI 강사 주문 시스템</h1>
          <p style={styles.subtitle}>수료번호와 강사명을 입력하세요</p>
          <div style={styles.formGroup}>
            <label style={styles.label}>수료번호</label>
            <input type="text" placeholder="예: AAA-2026-000" value={certNum}
              onChange={(e) => setCertNum(formatCertNum(e.target.value))} style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>강사명</label>
            <input type="text" placeholder="예: 홍길동" value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)} style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()} />
          </div>
          {authError && <p style={styles.error}>{authError}</p>}
          <button style={styles.button} onClick={handleAuth} disabled={loadingInstructors}>
            {loadingInstructors ? '로드 중...' : '인증'}
          </button>
        </div>
      </div>
    );
  }

  // 주문 화면
  if (step === 'order') {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.orderBox, opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.45s ease, transform 0.45s ease' }}>
          <div style={styles.header}>
            <h1 style={styles.title}>DCI 강사 주문 시스템</h1>
            <p style={styles.userInfo}>{currentInstructor.name} ({currentInstructor.id})</p>
          </div>

          {[
            { title: '색소류 (Pigment)', items: PRODUCTS.pigments },
            { title: '바인더류 (Binder & Powder)', items: PRODUCTS.binders },
            { title: '진단카드·스티커류 (Diagnostic Card & Sticker)', items: PRODUCTS.cards },
          ].map(({ title, items }) => {
            const visibleItems = filterItems(items);
            if (visibleItems.length === 0) return null;
            return (
              <div key={title} style={styles.category}>
                <h2 style={styles.categoryTitle}>{title}</h2>
                <div style={styles.categoryBody}>
                  {visibleItems.map((product) => (
                    <div key={product.code} style={styles.productRow}>
                      <div style={styles.productInfo}>
                        <div style={styles.productName}>{product.name}</div>
                        <div style={styles.productSpec}>{product.spec}</div>
                      </div>
                      <div style={styles.productPrice}>{product.price.toLocaleString()}원</div>
                      <input type="number" min="0" value={cart[product.code] || 0}
                        onChange={(e) => handleQuantityChange(product.code, parseInt(e.target.value) || 0)}
                        style={styles.quantityInput} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={styles.shippingSection}>
            <h2 style={styles.categoryTitle}>배송 정보</h2>
            {[
              { label: '이메일', key: 'email', type: 'email', placeholder: 'example@email.com' },
              { label: '연락처', key: 'phone', type: 'tel', placeholder: '010-1234-5678' },
              { label: '배송 주소', key: 'address', type: 'text', placeholder: '서울시 강남구...' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={styles.formGroup}>
                <label style={styles.label}>{label}</label>
                <input type={type} value={orderForm[key]} placeholder={placeholder}
                  onChange={(e) => {
                    const val = key === 'phone' ? formatPhone(e.target.value) : e.target.value;
                    setOrderForm({ ...orderForm, [key]: val });
                  }}
                  style={styles.input} />
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>요청사항</label>
              <textarea value={orderForm.note} style={styles.textarea} rows="3"
                placeholder="배송 시 요청사항을 입력하세요"
                onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })} />
            </div>
          </div>

          <div style={styles.footer}>
            {/* 주문 내역 요약 */}
            {cartItems.length > 0 && (
              <div style={styles.orderSummary}>
                <div style={styles.summaryTitle}>주문 내역</div>
                {cartItems.map((item, idx) => (
                  <div key={item.code} style={styles.summaryRow}>
                    <span style={styles.summaryIndex}>{idx + 1}.</span>
                    <span style={styles.summaryName}>{item.name}</span>
                    <span style={styles.summarySpec}>({item.spec})</span>
                    <span style={styles.summaryQty}>×{item.quantity}</span>
                    <span style={styles.summarySubtotal}>{item.subtotal.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            )}

            {/* 금액 합계 */}
            <div style={styles.totalDetails}>
              <div style={styles.totalRow}><span>상품 총액</span><span>{calculateTotal().toLocaleString()}원</span></div>
              <div style={styles.totalRow}><span>배송비</span><span>+{SHIPPING_FEE.toLocaleString()}원</span></div>
              <div style={{ ...styles.totalRow, borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px', fontWeight: '700', fontSize: '16px', color: '#2c3e50' }}>
                <span>합계</span><span>{getTotalWithShipping().toLocaleString()}원</span>
              </div>
            </div>
            <button style={styles.submitButton} onClick={handleSubmitOrder}
              disabled={submitting || cartItems.length === 0 || !orderForm.email || !orderForm.phone || !orderForm.address}>
              {submitting ? '주문 처리 중...' : '주문하기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 완료 화면
  return (
    <div style={styles.container}>
      <div style={styles.completeBox}>
        <h1 style={styles.completeTitle}>주문이 완료되었습니다</h1>
        <p style={styles.completeMessage}>
          입금 확인 후, 주문서가 <strong>{orderForm.email}</strong>로 발송됩니다.
        </p>
        <div style={styles.accountBox}>
          <div style={styles.amountRow}>
            <span>주문금액 / Order Amount</span>
            <span>{calculateTotal().toLocaleString()}원</span>
          </div>
          <div style={styles.amountRow}>
            <span>배송비 / Shipping</span>
            <span>3,000원</span>
          </div>
          <div style={{ ...styles.amountRow, borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '6px', fontWeight: '700', color: '#2c3e50' }}>
            <span>총액 / Total</span>
            <span>{getTotalWithShipping().toLocaleString()}원</span>
          </div>
        </div>
        <div style={styles.accountBox}>
          <p style={styles.accountLabel}>입금 계좌 정보 / Bank Account</p>
          <p style={styles.accountBank}>국민은행 / Kookmin Bank&nbsp;&nbsp;000-888-0088</p>
          <p style={styles.accountName}>색다른컬러연구소</p>
          <p style={styles.accountNote}>배송은 입금 확인 후, 영업일 기준 2~3일 소요<br />Delivery: 2–3 business days after payment</p>
        </div>
        <button style={styles.button} onClick={() => {
          setStep('auth'); setAuthenticated(false); setCertNum(''); setInstructorName('');
          setCart({}); setOrderForm({ email: '', phone: '', address: '', note: '' }); setOrderComplete(false);
        }}>
          새로운 주문
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f8f8', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  authBox: { maxWidth: '480px', margin: '80px auto', background: 'white', padding: '40px 30px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  orderBox: { maxWidth: '900px', margin: '20px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  completeBox: { maxWidth: '480px', margin: '80px auto', background: 'white', padding: '50px 30px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#2c3e50' },
  completeTitle: { fontSize: '26px', fontWeight: '700', margin: '0 0 16px 0', color: '#2c3e50' },
  subtitle: { fontSize: '14px', color: '#aaa', margin: '0 0 28px 0' },
  completeMessage: { fontSize: '15px', color: '#666', lineHeight: '1.7', margin: '0 0 24px 0' },
  accountBox: { background: '#f4f6f8', borderRadius: '8px', padding: '20px', marginBottom: '16px' },
  amountRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '6px' },
  accountLabel: { fontSize: '12px', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  accountBank: { fontSize: '18px', fontWeight: '700', color: '#2c3e50', margin: '0 0 4px 0' },
  accountName: { fontSize: '14px', color: '#555', margin: '0 0 10px 0' },
  accountNote: { fontSize: '13px', color: '#e74c3c', margin: '0', fontWeight: '500' },
  header: { marginBottom: '28px', paddingBottom: '18px', borderBottom: '1px solid #eee' },
  userInfo: { fontSize: '13px', color: '#888', margin: '6px 0 0 0' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  error: { color: '#e74c3c', fontSize: '13px', margin: '8px 0 0 0' },
  button: { width: '100%', padding: '13px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  submitButton: { display: 'block', width: '100%', padding: '14px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '20px' },
  category: { marginBottom: '28px' },
  categoryTitle: { fontSize: '15px', fontWeight: '700', color: '#2c3e50', margin: '0 0 12px 0', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' },
  categoryBody: { paddingLeft: '12px' },
  productRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  productInfo: { flex: 1 },
  productName: { fontSize: '14px', fontWeight: '500', color: '#333' },
  productSpec: { fontSize: '12px', color: '#aaa', marginTop: '2px' },
  productPrice: { fontSize: '14px', fontWeight: '600', color: '#2c3e50', minWidth: '70px', textAlign: 'right' },
  quantityInput: { width: '52px', padding: '6px', marginLeft: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', textAlign: 'center' },
  shippingSection: { marginTop: '36px', paddingTop: '28px', borderTop: '2px solid #f0f0f0' },
  footer: { marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #eee' },
  orderSummary: { background: '#f9f9f9', borderRadius: '6px', padding: '14px 16px', marginBottom: '18px' },
  summaryTitle: { fontSize: '13px', fontWeight: '700', color: '#2c3e50', marginBottom: '10px', letterSpacing: '0.3px' },
  summaryRow: { display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '13px', color: '#555', marginBottom: '6px' },
  summaryIndex: { minWidth: '18px', color: '#aaa' },
  summaryName: { flex: 1, color: '#333' },
  summarySpec: { fontSize: '12px', color: '#aaa' },
  summaryQty: { minWidth: '32px', textAlign: 'right', color: '#888' },
  summarySubtotal: { minWidth: '72px', textAlign: 'right', fontWeight: '600', color: '#2c3e50' },
  totalDetails: { textAlign: 'right', marginBottom: '4px' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '24px', fontSize: '14px', color: '#666', marginBottom: '6px' },
};
