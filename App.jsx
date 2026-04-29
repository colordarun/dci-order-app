import React, { useState, useEffect } from 'react';

// Google Apps Script 배포 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAv-J8yX3Fll8OWgfTfrcgBsQlcZxrF8XpwNrr34Q1NIKO8ZEaTA3_s8cUIX8LtKD0/exec';

// 상품 데이터 (이것은 변경되지 않음)
const PRODUCTS = {
  pigments: [
    { code: 'PIG-Z.BR', name: 'Z브라운 크림', spec: '10g', price: 7000, category: 'pigment' },
    { code: 'PWD-Z.BR', name: 'Z브라운 분말', spec: '20g', price: 9000, category: 'pigment' },
    { code: 'PIG-X.RD', name: 'X레드 크림', spec: '10g', price: 5000, category: 'pigment' },
    { code: 'PIG-Z.RD', name: 'Z레드 크림', spec: '10g', price: 9000, category: 'pigment' },
    { code: 'PIG-YL', name: '옐로우 크림', spec: '10g', price: 5000, category: 'pigment' },
    { code: 'PIG-WT', name: '화이트 크림', spec: '10g', price: 4500, category: 'pigment' },
    { code: 'PIG-WT.2', name: '화이트 크림 2개 묶음', spec: '10g×2', price: 8000, category: 'pigment' },
    { code: 'PIG-BL', name: '블루 액상', spec: '5g', price: 3000, category: 'pigment' },
    { code: 'PIG-BK', name: '블랙 액상', spec: '5g', price: 3000, category: 'pigment' },
    { code: 'PIG-OR', name: '오렌지 크림', spec: '10g', price: 5000, category: 'pigment' },
    { code: 'PIG-MG', name: '마젠타 크림', spec: '10g', price: 5000, category: 'pigment' },
    { code: 'PIG-VT', name: '바이올렛 액상', spec: '10g', price: 6000, category: 'pigment' },
  ],
  binders: [
    { code: 'BND-FND', name: '파운데이션바인더', spec: '100g', price: 23000, category: 'binder' },
    { code: 'BND-FND.L', name: '파운데이션바인더 대용량', spec: '1L', price: 200000, category: 'binder' },
    { code: 'PWD-MAT', name: '매트파우더', spec: '100g', price: 15000, category: 'binder' },
    { code: 'BND-LIP', name: '립글로스바인더', spec: '50g', price: 3000, category: 'binder' },
  ],
  cards: [
    { code: 'CARD-SK', name: '진단카드(스킨용)', spec: '10개 묶음', price: 15000, category: 'card' },
    { code: 'CARD-LP', name: '진단카드(립용)', spec: '10개 묶음', price: 15000, category: 'card' },
    { code: 'CARD-LC', name: '진단카드(립앤치크용)', spec: '10개 묶음', price: 15000, category: 'card' },
    { code: 'STCKR-SK', name: '진단스티커(스킨용)', spec: '10개 묶음', price: 30000, category: 'card' },
    { code: 'CARD-SK1', name: '진단카드(스킨용) 낱개', spec: '1개', price: 2000, category: 'card' },
    { code: 'CARD-LP1', name: '진단카드(립용) 낱개', spec: '1개', price: 2000, category: 'card' },
    { code: 'CARD-LC1', name: '진단카드(립앤치크용) 낱개', spec: '1개', price: 2000, category: 'card' },
    { code: 'STCKR-SK1', name: '진단스티커(스킨용) 낱개', spec: '1장', price: 4000, category: 'card' },
  ],
};

export default function DCIOrderApp() {
  const [step, setStep] = useState('auth'); // auth, order, confirm
  const [certNum, setCertNum] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState(null);

  // 앱 로드 시 구글 시트에서 강사 데이터 불러오기
  useEffect(() => {
    const loadInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'getInstructors',
          }),
        });
        const result = await response.json();
        if (result.success) {
          setInstructors(result.data);
        } else {
          console.log('강사 데이터 로드 실패:', result.message);
          setInstructors([]);
        }
      } catch (error) {
        console.log('강사 데이터 로드 중 오류:', error);
        setInstructors([]);
      }
      setLoadingInstructors(false);
    };
    loadInstructors();
  }, []);
  const [cart, setCart] = useState({});
  const [orderForm, setOrderForm] = useState({
    email: '',
    phone: '',
    address: '',
    note: '',
  });
  const [orderComplete, setOrderComplete] = useState(false);

  // 인증 처리
  const handleAuth = () => {
    setAuthError('');
    const instructor = instructors.find(
      (inst) => inst.id === certNum.trim() && inst.name === instructorName.trim()
    );

    if (instructor) {
      setCurrentInstructor(instructor);
      setAuthenticated(true);
      setStep('order');
    } else {
      setAuthError('수료번호 또는 강사명이 일치하지 않습니다.');
    }
  };

  // 장바구니 수량 변경
  const handleQuantityChange = (code, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[code];
      setCart(newCart);
    } else {
      setCart({ ...cart, [code]: quantity });
    }
  };

  // 장바구니 총액 계산
  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [code, qty]) => {
      const product = [...PRODUCTS.pigments, ...PRODUCTS.binders, ...PRODUCTS.cards].find(
        (p) => p.code === code
      );
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  const SHIPPING_FEE = 3000;
  const getTotalWithShipping = () => calculateTotal() + SHIPPING_FEE;

  // 주문 제출
  const handleSubmitOrder = async () => {
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
      items: Object.entries(cart).map(([code, qty]) => {
        const product = [...PRODUCTS.pigments, ...PRODUCTS.binders, ...PRODUCTS.cards].find(
          (p) => p.code === code
        );
        return {
          code: product.code,
          name: product.name,
          spec: product.spec,
          price: product.price,
          quantity: qty,
          subtotal: product.price * qty,
        };
      }),
      subtotal: calculateTotal(),
      total: getTotalWithShipping(),
    };

    // Google Apps Script로 주문 처리
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxAv-J8yX3Fll8OWgfTfrcgBsQlcZxrF8XpwNrr34Q1NIKO8ZEaTA3_s8cUIX8LtKD0/exec',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'processOrder',
            orderData: orderData,
          }),
        }
      );
      const result = await response.json();
      
      if (result.success) {
        setOrderComplete(true);
        setStep('confirm');
      } else {
        alert('주문 처리 중 오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      // 개발 단계에서는 로컬에서 처리
      console.log('주문 데이터:', orderData);
      alert(
        `주문이 완료되었습니다.\n\n주문번호: ${orderData.order_id}\n총액: ${getTotalWithShipping().toLocaleString()}원`
      );
      setOrderComplete(true);
      setStep('confirm');
    }
  };

  // 인증 화면
  if (step === 'auth' && !authenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.authBox}>
          <h1 style={styles.title}>DCI 강사 주문 시스템</h1>
          <p style={styles.subtitle}>수료번호와 강사명을 입력하세요</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>수료번호</label>
            <input
              type="text"
              placeholder="예: DCI-2024-001"
              value={certNum}
              onChange={(e) => setCertNum(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>강사명</label>
            <input
              type="text"
              placeholder="예: 김민영"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
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
  if (step === 'order' && authenticated && !orderComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.orderBox}>
          <div style={styles.header}>
            <h1 style={styles.title}>DCI 강사 주문 시스템</h1>
            <p style={styles.userInfo}>
              {currentInstructor.name} ({currentInstructor.id})
            </p>
          </div>

          {/* 색소 카테고리 */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>색소 (Pigment)</h2>
            {PRODUCTS.pigments.map((product) => (
              <div key={product.code} style={styles.productRow}>
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productSpec}>{product.spec}</div>
                </div>
                <div style={styles.productPrice}>{product.price.toLocaleString()}원</div>
                <input
                  type="number"
                  min="0"
                  value={cart[product.code] || 0}
                  onChange={(e) =>
                    handleQuantityChange(product.code, parseInt(e.target.value) || 0)
                  }
                  style={styles.quantityInput}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* 바인더·파우더 카테고리 */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>바인더 · 파우더</h2>
            {PRODUCTS.binders.map((product) => (
              <div key={product.code} style={styles.productRow}>
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productSpec}>{product.spec}</div>
                </div>
                <div style={styles.productPrice}>{product.price.toLocaleString()}원</div>
                <input
                  type="number"
                  min="0"
                  value={cart[product.code] || 0}
                  onChange={(e) =>
                    handleQuantityChange(product.code, parseInt(e.target.value) || 0)
                  }
                  style={styles.quantityInput}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* 진단카드·스티커 카테고리 */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>진단카드 · 스티커</h2>
            {PRODUCTS.cards.map((product) => (
              <div key={product.code} style={styles.productRow}>
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productSpec}>{product.spec}</div>
                </div>
                <div style={styles.productPrice}>{product.price.toLocaleString()}원</div>
                <input
                  type="number"
                  min="0"
                  value={cart[product.code] || 0}
                  onChange={(e) =>
                    handleQuantityChange(product.code, parseInt(e.target.value) || 0)
                  }
                  style={styles.quantityInput}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* 배송 정보 */}
          <div style={styles.shippingSection}>
            <h2 style={styles.categoryTitle}>배송 정보</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>이메일</label>
              <input
                type="email"
                value={orderForm.email}
                onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                style={styles.input}
                placeholder="example@email.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>연락처</label>
              <input
                type="tel"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                style={styles.input}
                placeholder="010-1234-5678"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>배송 주소</label>
              <input
                type="text"
                value={orderForm.address}
                onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                style={styles.input}
                placeholder="서울시 강남구..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>요청사항</label>
              <textarea
                value={orderForm.note}
                onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                style={styles.textarea}
                placeholder="배송 시 요청사항을 입력하세요"
                rows="3"
              />
            </div>
          </div>

          {/* 총액 및 버튼 */}
          <div style={styles.footer}>
            <div style={styles.totalBox}>
              <div style={styles.totalDetails}>
                <div style={styles.totalRow}>
                  <span>상품 총액</span>
                  <span>{calculateTotal().toLocaleString()}원</span>
                </div>
                <div style={styles.totalRow}>
                  <span>배송비</span>
                  <span>+{SHIPPING_FEE.toLocaleString()}원</span>
                </div>
                <div style={styles.totalRow} style={{ ...styles.totalRow, borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', fontWeight: '700' }}>
                  <span>합계</span>
                  <span>{getTotalWithShipping().toLocaleString()}원</span>
                </div>
              </div>
            </div>
            <button
              style={styles.submitButton}
              onClick={handleSubmitOrder}
              disabled={Object.keys(cart).length === 0 || !orderForm.email || !orderForm.phone || !orderForm.address}
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (orderComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.completeBox}>
          <h1 style={styles.completeTitle}>주문이 완료되었습니다</h1>
          <p style={styles.completeMessage}>
            입금 확인 후, 주문서가 <strong>{currentInstructor.email}</strong>로 발송됩니다.
            <br />
            <br />
            메일에는 계좌정보와 배송 안내가 포함되어 있습니다.
          </p>
          <button
            style={styles.button}
            onClick={() => {
              setStep('auth');
              setAuthenticated(false);
              setCertNum('');
              setInstructorName('');
              setCart({});
              setOrderForm({ email: '', phone: '', address: '', note: '' });
              setOrderComplete(false);
            }}
          >
            새로운 주문
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f8f8',
    padding: '20px',
    fontFamily: '"Segoe UI", "한글", sans-serif',
  },
  authBox: {
    maxWidth: '500px',
    margin: '60px auto',
    background: 'white',
    padding: '40px 30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  orderBox: {
    maxWidth: '900px',
    margin: '20px auto',
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  completeBox: {
    maxWidth: '500px',
    margin: '60px auto',
    background: 'white',
    padding: '50px 30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 10px 0',
    color: '#333',
  },
  completeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '14px',
    color: '#999',
    margin: '0 0 30px 0',
  },
  completeMessage: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 40px 0',
  },
  header: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  userInfo: {
    fontSize: '14px',
    color: '#666',
    margin: '10px 0 0 0',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px',
    margin: '10px 0',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  submitButton: {
    padding: '14px 24px',
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '20px',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '20px',
    textAlign: 'center',
  },
  category: {
    marginBottom: '30px',
  },
  categoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 15px 0',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  productSpec: {
    fontSize: '12px',
    color: '#999',
    marginTop: '3px',
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: '80px',
    textAlign: 'right',
  },
  quantityInput: {
    width: '50px',
    padding: '6px',
    marginLeft: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
  },
  shippingSection: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '2px solid #f0f0f0',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  totalDetails: {
    textAlign: 'right',
    minWidth: '200px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
    gap: '20px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
  },
};
