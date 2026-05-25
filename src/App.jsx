import React, { useState, useEffect } from 'react';

// Google Apps Script 배포 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAv-J8yX3Fll8OWgfTfrcgBsQlcZxrF8XpwNrr34Q1NIKO8ZEaTA3_s8cUIX8LtKD0/exec';

// 상품 데이터 (3단가: priceL / priceS / priceDefault)
const PRODUCTS = {
  pigments: [
    { code: 'PIG-Z.BR',  name: 'YZ 브라운 색소 / Z-Brown',                 spec: '10g',              priceL: 7000,   priceS: 7700,   priceDefault: 8400,  color: '#9e5c3f', shape: 'circle' },
    { code: 'PWD-Z.BR',  name: 'YZ 브라운 색소 파우더 / Z-Brown Powder',     spec: '10g, 분말',        priceL: 9000,   priceS: 9900,   priceDefault: 10800, color: '#9e5c3f', shape: 'square' },
    { code: 'PIG-X.RD',  name: 'X 레드브릭 색소 / X-Red',                   spec: '10g',              priceL: 5000,   priceS: 5500,   priceDefault: 6000,  color: '#a11515', shape: 'circle' },
    { code: 'PIG-YL',    name: '옐로우 색소 / Yellow',                        spec: '10g',              priceL: 5000,     priceS: 5500, priceDefault: 6000, color: '#D4A800', shape: 'circle' },
    { code: 'PIG-Z.RD',  name: 'YZ 레드 색소 / Z-Red(vivid)',               spec: '10g, ONLY for Lips',    priceL: 9000,     priceS: 9900, priceDefault: 10800, color: '#f50707', shape: 'circle' },
    { code: 'PIG-OR',    name: '주황 색소 / Orange',                        spec: '10g, ONLY for Lips',    priceL: 5000,    priceS: 5500, priceDefault: 6000, color: '#ff6f00', shape: 'circle' },
    { code: 'PIG-MG',    name: '마젠타 색소 / Magenta',                     spec: '10g, ONLY for Lips',    priceL: 5000,   priceS: 5500,   priceDefault: 6000,  color: '#e30e87', shape: 'circle' },
    { code: 'PIG-VT',    name: '바이올렛 색소 / Violet',                        spec: '10g, for Lips',    priceL: 6000,   priceS: 6600,   priceDefault: 7200,  color: '#6A3D9A', shape: 'circle' },
    { code: 'PIG-BL',    name: '블루 색소 / Blue',                          spec: '5g',               priceL: 3000,   priceS: 3300,   priceDefault: 3600,  color: '#274EA6', shape: 'circle' },
    { code: 'PIG-BK',    name: '블랙 색소 / Black',                         spec: '5g',               priceL: 3000,   priceS: 3300,   priceDefault: 3600,  color: '#1E1E1E', shape: 'circle' },
    { code: 'PIG-WT',    name: '화이트 색소 / White',                         spec: '10g',              priceL: 4500,   priceS: 4900,   priceDefault: 5400,  color: '#F0EDE8', shape: 'circle' },
    { code: 'PIG-WT.2',  name: '화이트 색소 2개 묶음 / White ×2 Set',        spec: '10g×2',            priceL: 8000,   priceS: 8800,   priceDefault: 9600,  color: '#F0EDE8', shape: 'circle' },
  ],
  binders: [
    { code: 'BND-FND100', name: '파운데이션 바인더100 / Foundation Binder',              spec: '100g',            priceL: 23000,  priceS: 25300,  priceDefault: 27600 },
    { code: 'BND-FND500', name: '파운데이션 바인더500 / Foundation Binder',              spec: '500g',            priceL: 110000,  priceS: 121000,  priceDefault: 130000 },
    { code: 'BND-FND1k',  name: '파운데이션 바인더 대용량 / Foundation Binder (1kg)', spec: '1kg',             priceL: 200000, priceS: 220000, priceDefault: 240000 },
    { code: 'PWD-MAT',      name: '매트 파우더 / Matte Powder',                       spec: '100g, 분말',       priceL: 15000, priceS: 16500, priceDefault: 18000 },
    { code: 'PWD-GLW',       name: '글로우 파우더 / Matte Powder',                    spec: '100g, 분말',       priceL: 15000, priceS: 16500, priceDefault: 18000 },
    { code: 'BND-LIP1',   name: '립글로스 바인더 / Lip Gloss Binder',                 spec: '50ml',            priceL: 9000,   priceS: 9900,   priceDefault: 10800 },
    { code: 'BND-LIP5',   name: '립글로스 바인더 대용량 / Lip Gloss Binder (250ml)',   spec: '250ml, 5개 묶음', priceL: 34000,  priceS: 37400,  priceDefault: 40800 },
  ],
  cards: [
    { code: 'CARD-SK5',   name: '스킨용 진단카드*5 / Skin Diagnostic Card *5',              spec: '5개 묶음',  priceL: 10000, priceS: 11000, priceDefault: 12000 },
    { code: 'CARD-SK10',  name: '스킨용 진단카드*10 / Skin Diagnostic Card *10',             spec: '10개 묶음', priceL: 15000, priceS: 16500, priceDefault: 18000 },
    { code: 'CARD-LP5',   name: '립용 진단카드*5 / Lip Diagnostic Card *5',                  spec: '5개 묶음',  priceL: 10000, priceS: 11000, priceDefault: 12000 },
    { code: 'CARD-LP10',  name: '립용 진단카드*10 / Lip Diagnostic Card *10',                spec: '10개 묶음', priceL: 15000, priceS: 16500, priceDefault: 18000 },
    { code: 'CARD-LC5',   name: '립앤치크용 진단카드*5 / Lip & Cheek Diagnostic Card *5',    spec: '5개 묶음',  priceL: 10000, priceS: 11000, priceDefault: 12000 },
    { code: 'CARD-LC10',  name: '립앤치크용 진단카드*10 / Lip & Cheek Diagnostic Card *10',  spec: '10개 묶음', priceL: 15000, priceS: 16500, priceDefault: 18000 },
    { code: 'STCKR-SK5',  name: '스킨용 진단 스티커*5 / Skin Diagnostic Sticker *5',         spec: '5개 묶음',  priceL: 20000, priceS: 22000, priceDefault: 24000 },
    { code: 'STCKR-SK10', name: '스킨용 진단 스티커*10 / Skin Diagnostic Sticker *10',       spec: '10개 묶음', priceL: 30000, priceS: 33000, priceDefault: 36000 },
  ],
  bottles: [
    { code: 'BTL-FDN', name: '파운데이션 용기 / Foundation Container', spec: '30g(펌프형)', priceL: 2200, priceS: 2700, priceDefault: 3000 },
    { code: 'BTL-LGS', name: '립글로스 용기 / Lip Gloss Container',    spec: '5ml',        priceL: 1200, priceS: 1600, priceDefault: 2000 },
  ],
};

// 과정별 주문 가능 제품 코드 (수료번호 첫 segment 기준)
const COURSE_PRODUCTS = {
  CCM1: [
    'PIG-Z.BR', 'PIG-X.RD', 'PIG-Z.RD', 'PIG-YL','PIG-OR', 'PIG-MG', 'PIG-BL',  'PIG-BK', 'PIG-WT',
    'BND-FND100', 'BND-FND500', 'BND-LIP1',
    'CARD-SK5', 'CARD-LP5',
    'BTL-FDN', 'BTL-LGS',
  ],
  SFDI: [
      'PIG-Z.BR', 'PWD-Z.BR', 'PIG-X.RD', 'PIG-YL', 'PIG-BL', 'PIG-BK', 'PIG-WT', 'PIG-WT.2',
    'BND-FND100', 'BND-FND1k', 'PWD-MAT', 'PWD-GLW',
    'CARD-SK5', 'CARD-SK10', 'STCKR-SK5', 'STCKR-SK10',
    'BTL-FDN',
    ],
  SLGI: [
    'PIG-X.RD', 'PIG-Z.RD', 'PIG-OR', 'PIG-MG', 'PIG-BK', 'PIG-WT', 'PIG-WT.2',
    'BND-LIP1', 'BND-LIP5',
    'CARD-LP5', 'CARD-LP10',
    'BTL-LGS',
    ],
  KFDI: [
    'PWD-Z.BR', 'PIG-X.RD', 'PIG-YL', 'PIG-WT',
    'BND-FND100', 'BND-FND1k',
    'CARD-SK5', 'CARD-SK10',
  ],
  KLCI: [
    'PIG-X.RD', 'PIG-Z.RD',  'PIG-VT', 'PIG-WT', 'PIG-BK',
    'CARD-LC5', 'CARD-LC10',
  ],

};

// MSDS PDF 파일 매핑: 제품코드 → 파일명(public/msds/{파일명}.pdf)
// 같은 파일명 = 공유 MSDS (중복 자동 제거)
// PDF 파일 추가 시 내게 알려주면 반영해줄게
const MSDS_MAP = {
  'PIG-Z.BR':   'PIG-Z.BR_msds',
  'PWD-Z.BR':   'PWD-Z.BR_msds',
  'PIG-X.RD':   'PIG-X.RD_msds',
  'PIG-Z.RD': 'PIG-Z.RD_msds',
  'PIG-YL':     'PIG-YL_msds',
  'PIG-WT':     'PIG-WT_msds',
  'PIG-WT.2':   'PIG-WT_msds',     // 공용
  'PIG-OR':     'PIG-OR_msds',
  'PIG-MG':     'PIG-MG_msds',
  'PIG-VT':     'PIG-VT_msds',
  'BND-FND100': 'BND-FND_msds',
  'BND-FND1k':  'BND-FND_msds',    // 공용
  'PWD-MAT':    'PWD-MAT_msds',
  'BND-LIP1':   'BND-LIP_msds',
  'BND-LIP5':   'BND-LIP_msds',    // 공용
  // PIG-BL, PIG-BK, PWD-GLW → 파일 없음
  // CARD, STCKR, BTL → 해당 없음
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
  if (!raw) return raw;

  // 알려진 과정 prefix만 허용 (긴 것부터 매칭)
  var knownPrefixes = Object.keys(COURSE_PRODUCTS).sort(function(a, b) { return b.length - a.length; });
  var prefix = '';
  for (var p = 0; p < knownPrefixes.length; p++) {
    if (raw.indexOf(knownPrefixes[p]) === 0) {
      prefix = knownPrefixes[p];
      break;
    }
  }
  // 미등록 과정코드는 알파벳 prefix로 폴백
  if (!prefix) {
    var m = raw.match(/^([A-Z]+)/);
    prefix = m ? m[1] : '';
  }
  if (!prefix) return raw;

  var digits = raw.slice(prefix.length);
  if (!/^[0-9]*$/.test(digits)) return raw;

  // PREFIX-0000-000 (숫자 7자리)
  var year = digits.slice(0, 4);
  var seq  = digits.slice(4, 7);
  if (seq.length  > 0) return prefix + '-' + year + '-' + seq;
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

  const normalize = (str) => str.trim().replace(/\s+/g, ' ').toLowerCase();

  const handleAuth = () => {
    setAuthError('');
    const instructor = instructors.find(
      (inst) => inst.id === certNum.trim() && normalize(inst.name) === normalize(instructorName)
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

  // 수료번호 첫 segment(첫 번째 '-' 앞)로 과정 prefix 추출
  const getCoursePrefix = (id) => id.split('-')[0];

  // 강사 등급(tier) 기반 단가 반환
  const getPrice = (product) => {
    const tier = currentInstructor?.tier;
    if (tier === 'L') return product.priceL;
    if (tier === 'S') return product.priceS;
    return product.priceDefault;
  };

  const allProducts = [
    ...PRODUCTS.pigments,
    ...PRODUCTS.binders,
    ...PRODUCTS.cards,
    ...PRODUCTS.bottles,
  ];

  // 과정별 허용 코드 기반 필터 (미등록 과정코드 = admin → 전체 노출)
  const coursePrefix = currentInstructor ? getCoursePrefix(currentInstructor.id) : null;
  const isAdmin = coursePrefix && !(coursePrefix in COURSE_PRODUCTS);
  const allowedCodes = isAdmin ? null : (currentInstructor ? (COURSE_PRODUCTS[coursePrefix] || []) : []);
  const filterItems = (items) => isAdmin ? items : items.filter((p) => allowedCodes.includes(p.code));

  const calculateTotal = () =>
    Object.entries(cart).reduce((total, [code, qty]) => {
      const product = allProducts.find((p) => p.code === code);
      return total + (product ? getPrice(product) * qty : 0);
    }, 0);

  const SHIPPING_FEE = 3500;
  const getTotalWithShipping = () => calculateTotal() + SHIPPING_FEE;

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([code, qty]) => {
      const product = allProducts.find((p) => p.code === code);
      const price = getPrice(product);
      return { ...product, quantity: qty, price, subtotal: price * qty };
    });

  // MSDS 제공 가능한 항목 (중복 파일명 제거)
  const msdsItems = (() => {
    const seen = new Set();
    const result = [];
    cartItems.forEach(item => {
      const file = MSDS_MAP[item.code];
      if (file && !seen.has(file)) {
        seen.add(file);
        result.push({ ...item, msdsFile: file });
      }
    });
    return result;
  })();

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
            <input type="text" placeholder="예: ABC-1234-000" value={certNum}
              onChange={(e) => setCertNum(formatCertNum(e.target.value))} style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>강사명</label>
            <input type="text" placeholder="예: 홍길동, JUNG JIEUN" value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)} style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()} />
          </div>
          {authError && <p style={styles.error}>{authError}</p>}
          <button style={styles.button} onClick={handleAuth} disabled={loadingInstructors}>
            {loadingInstructors ? '로드 중...' : '인증'}
          </button>
        </div>

        <div style={styles.contactBox}>
          <a href="https://center-pf.kakao.com/_DNmxdj/chats" target="_blank" rel="noreferrer" style={styles.kakaoBtn}>
            카카오채널 문의하기
          </a>
          <p style={styles.contactInfo}>Email: colordarun@kakao.com</p>
          <p style={styles.contactInfo}>02-2631-8805</p>
          <p style={styles.contactHours}>Open 10am – 6pm</p>
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
            { title: '색소류 (Pigment)',          items: PRODUCTS.pigments },
            { title: '바인더류 (Binder)',           items: PRODUCTS.binders },
            { title: '진단키트 (Diagnostic Kit)',   items: PRODUCTS.cards },
            { title: '용기류 (Container)',          items: PRODUCTS.bottles },
          ].map(({ title, items }) => {
            const visibleItems = filterItems(items);
            if (visibleItems.length === 0) return null;
            return (
              <div key={title} style={styles.category}>
                <h2 style={styles.categoryTitle}>{title}</h2>
                <div style={styles.categoryBody}>
                  {visibleItems.map((product) => (
                    <div key={product.code} style={styles.productRow}>
                      {product.color && (
                        <div style={{
                          width: '22px', height: '22px', flexShrink: 0,
                          borderRadius: product.shape === 'square' ? '5px' : '50%',
                          background: product.color,
                          border: '1px solid rgba(0,0,0,0.12)',
                          marginRight: '10px',
                        }} />
                      )}
                      <div style={styles.productInfo}>
                        <div style={styles.productName}>{product.name}</div>
                        <div style={styles.productSpec}>{product.spec}</div>
                      </div>
                      <div style={styles.productPrice}>{getPrice(product).toLocaleString()}원</div>
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

  // MSDS 다운로드 화면
  if (step === 'msds') {
    return (
      <div style={styles.container}>
        <div style={styles.authBox}>
          <h1 style={styles.title}>교육용 MSDS 제공</h1>
          <p style={{ ...styles.subtitle, marginBottom: '12px' }}>구매하신 제품의 MSDS 자료를 다운로드하실 수 있습니다</p>
          <div style={styles.msdsDisclaimer}>
            <p style={{ margin: '0 0 10px 0' }}>본 자료는 안전한 재료 취급을 위해 사용된 원료의 물리화학적 특성과 안전 정보를 제공하기 위한 자료입니다. 다만, 이 자료에 포함된 정보는 교육 목적으로만 활용되어야 하며, 상업적 목적의 제품 제조 및 판매는 엄격히 금지됩니다.</p>
            <p style={{ margin: 0 }}>This document is to support student learning in safe material handling practices, we disclose the physical, chemical, and safety characteristics of the raw materials used in our formulations. However, all information contained in this material is strictly for educational purposes only. Any commercial use for product manufacturing or sales is strictly prohibited.</p>
          </div>

          {msdsItems.length > 0 && (
            <div style={{ marginTop: '22px' }}>
              <div style={styles.msdsHeader}>
                <span style={{ fontSize: '12px', color: '#c4a0ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MSDS 자료 다운로드</span>
                <span style={{ fontSize: '11px', color: '#c4a0ad' }}>※ English only</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {msdsItems.map(item => (
                  <div key={item.msdsFile} style={styles.msdsRow}>
                    <div style={styles.productInfo}>
                      <div style={styles.productName}>{item.name}</div>
                      <div style={styles.productSpec}>{item.msdsFile}</div>
                    </div>
                    <a href={`/msds/${item.msdsFile}.pdf`} target="_blank" rel="noreferrer" style={styles.msdsBtn}>
                      PDF download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <span>3,500원</span>
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
          <p style={styles.accountNote}>배송은 입금 확인 후, 영업일 기준 3~5일 소요<br />Delivery: 3–5 business days after payment</p>
        </div>
        <button style={styles.msdsDownloadBtn} onClick={() => setStep('msds')}>
          물질안전보건자료 다운로드
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#fdf5f7', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  authBox: { maxWidth: '480px', margin: '80px auto', background: 'white', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(150,84,104,0.10)' },
  orderBox: { maxWidth: '900px', margin: '20px auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(150,84,104,0.10)' },
  completeBox: { maxWidth: '480px', margin: '80px auto', background: 'white', padding: '50px 30px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(150,84,104,0.10)', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#965468' },
  completeTitle: { fontSize: '26px', fontWeight: '700', margin: '0 0 16px 0', color: '#965468' },
  subtitle: { fontSize: '14px', color: '#c4a0ad', margin: '0 0 28px 0' },
  completeMessage: { fontSize: '15px', color: '#7a5a63', lineHeight: '1.7', margin: '0 0 24px 0' },
  accountBox: { background: '#fdf0f3', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  amountRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7a5a63', marginBottom: '6px' },
  accountLabel: { fontSize: '12px', color: '#c4a0ad', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  accountBank: { fontSize: '18px', fontWeight: '700', color: '#965468', margin: '0 0 4px 0' },
  accountName: { fontSize: '14px', color: '#7a5a63', margin: '0 0 10px 0' },
  accountNote: { fontSize: '13px', color: '#c0637a', margin: '0', fontWeight: '500' },
  header: { marginBottom: '28px', paddingBottom: '18px', borderBottom: '1px solid #f5e2e7' },
  userInfo: { fontSize: '13px', color: '#c4a0ad', margin: '6px 0 0 0' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#7a5a63', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e8d0d6', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #e8d0d6', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  error: { color: '#c0637a', fontSize: '13px', margin: '8px 0 0 0' },
  button: { width: '100%', padding: '13px', background: '#965468', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  submitButton: { display: 'block', width: '100%', padding: '14px', background: '#965468', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '20px' },
  category: { marginBottom: '28px' },
  categoryTitle: { fontSize: '15px', fontWeight: '700', color: '#965468', margin: '0 0 12px 0', paddingBottom: '10px', borderBottom: '2px solid #f5e2e7' },
  categoryBody: { paddingLeft: '12px' },
  productRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #faeef1' },
  productInfo: { flex: 1 },
  productName: { fontSize: '14px', fontWeight: '500', color: '#4a3038' },
  productSpec: { fontSize: '12px', color: '#c4a0ad', marginTop: '2px' },
  productPrice: { fontSize: '14px', fontWeight: '600', color: '#965468', minWidth: '70px', textAlign: 'right' },
  quantityInput: { width: '52px', padding: '6px', marginLeft: '12px', border: '1px solid #e8d0d6', borderRadius: '6px', fontSize: '14px', textAlign: 'center' },
  shippingSection: { marginTop: '36px', paddingTop: '28px', borderTop: '2px solid #f5e2e7' },
  footer: { marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f5e2e7' },
  orderSummary: { background: '#fdf0f3', borderRadius: '8px', padding: '14px 16px', marginBottom: '18px' },
  summaryTitle: { fontSize: '13px', fontWeight: '700', color: '#965468', marginBottom: '10px', letterSpacing: '0.3px' },
  summaryRow: { display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '13px', color: '#7a5a63', marginBottom: '6px' },
  summaryIndex: { minWidth: '18px', color: '#c4a0ad' },
  summaryName: { flex: 1, color: '#4a3038' },
  summarySpec: { fontSize: '12px', color: '#c4a0ad' },
  summaryQty: { minWidth: '32px', textAlign: 'right', color: '#b89aa2' },
  summarySubtotal: { minWidth: '72px', textAlign: 'right', fontWeight: '600', color: '#965468' },
  totalDetails: { textAlign: 'right', marginBottom: '4px' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '24px', fontSize: '14px', color: '#7a5a63', marginBottom: '6px' },
  contactBox: { maxWidth: '480px', margin: '16px auto 0', textAlign: 'center', padding: '0 10px' },
  contactTitle: { fontSize: '12px', fontWeight: '600', color: '#c4a0ad', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.8px' },
  kakaoBtn: { display: 'inline-block', padding: '8px 20px', background: '#c4a0ad', color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', marginBottom: '12px' },
  contactInfo: { fontSize: '13px', color: '#b89aa2', margin: '4px 0' },
  contactHours: { fontSize: '12px', color: '#c4a0ad', margin: '4px 0' },
  msdsDisclaimer: { fontSize: '11px', color: '#b89aa2', lineHeight: '1.7', background: '#fdf5f7', borderRadius: '8px', padding: '12px 14px' },
  msdsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  msdsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #f5e2e7', borderRadius: '8px' },
  msdsBtn: { fontSize: '12px', padding: '6px 14px', borderRadius: '20px', background: '#bababa', color: '#ffffff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' },
  msdsDownloadBtn: { width: '100%', padding: '11px', background: '#bababa', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '10px' },
};
