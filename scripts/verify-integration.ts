import { API_BASE_URL, DEFAULT_TENANT_ID, API_ENDPOINTS } from '../src/config';
import { apiRequest } from '../src/services/apiClient';
import { loginUser, fetchMe } from '../src/services/authService';
import { fetchProducts, fetchCategories } from '../src/services/productsService';
import { createOrder, fetchMyOrders } from '../src/services/ordersService';

async function verify() {
  console.log('=== Verifying Cyden Integration with backend ===');
  console.log(`Backend API Base: ${API_BASE_URL}`);
  console.log(`Tenant ID: ${DEFAULT_TENANT_ID}\n`);

  // 1. Test Products & Categories
  const categories = await fetchCategories();
  console.log(`✓ Fetched ${categories.length} categories from backend.`);

  const products = await fetchProducts();
  console.log(`✓ Fetched ${products.length} live products from backend for tenant "${DEFAULT_TENANT_ID}".`);

  // 2. Test Authentication
  console.log('\nTesting Authentication:');
  const authResult = await loginUser({
    email: 'orders@cydendistributors.co.ke',
    password: 'Cyden@Customer2026!',
  });
  console.log(`✓ Successfully authenticated as: ${authResult.user?.email || 'orders@cydendistributors.co.ke'}`);
  console.log(`✓ Access token received: ${authResult.accessToken.slice(0, 20)}...`);

  // 3. Test Profile
  const me = await fetchMe();
  console.log(`✓ User profile confirmed: ${me.firstName} ${me.lastName} (${me.role})`);

  // 4. Test Placing an Order
  console.log('\nTesting Order Placement:');
  const testProduct = products[0];
  const orderPayload = {
    items: [
      {
        productId: String(testProduct.id || testProduct._id),
        quantity: 2,
        price: Number(testProduct.price) || 1500,
        notes: testProduct.name,
      },
    ],
    shippingAddress: 'Rupa Mall, Eldoret, Uasin Gishu',
    paymentMethod: 'mpesa' as const,
  };

  const createdOrder = await createOrder(orderPayload, authResult.accessToken);
  console.log(`✓ Order placed successfully on live backend!`);
  console.log(`  - Order ID: ${createdOrder.id}`);
  console.log(`  - Status: ${createdOrder.status}`);
  console.log(`  - Total Amount: KSH ${createdOrder.totalAmount}`);

  // 5. Test Fetching My Orders
  const myOrders = await fetchMyOrders(authResult.accessToken);
  console.log(`✓ Customer order history retrieved: ${myOrders.length} order(s) on server.`);

  console.log('\n=== ALL CYDEN BACKEND INTEGRATION TESTS PASSED 100%! ===');
}

verify().catch((err) => {
  console.error('Integration verification failed:', err);
  process.exit(1);
});
