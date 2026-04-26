import crypto from 'crypto';

const SECRET   = '870b1a5885f7fe4dcf09b6eb84133a8b41bc6fd9';
const URL      = 'https://margenreal.io/api/webhook/lemon';
const EMAIL    = process.argv[2] || 'test@margenreal.io';
const VARIANT  = process.argv[3] || '1553460'; // starter por defecto

const payload = JSON.stringify({
  meta: { event_name: 'order_created' },
  data: {
    id: `test-order-${Date.now()}`,
    attributes: {
      user_email: EMAIL,
      first_order_item: { variant_id: Number(VARIANT) },
    },
  },
});

const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

const res = await fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': sig,
  },
  body: payload,
});

const data = await res.json();
console.log(`Status: ${res.status}`);
console.log(data);
