import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { formatPrice, generateOrderNumber } from '../lib/utils';
import { useAddresses } from '../hooks/useAddresses';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addresses } = useAddresses();


  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'cod'>('cod');
  const isRetailOnly = items.every((item) => !item.product.product_type || item.product.product_type === 'retail');

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = subtotal >= 99 ? 0 : 9.99;
  const taxAmount = subtotal * 0.08;
  const total = subtotal + shippingCost + taxAmount;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Checkout</h1>
          <p className="text-gray-600 mb-8">You need an account to place orders, track shipments, and view your order history.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            >
              Sign In to Continue
            </Button>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Keep Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingInfo.firstName) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email) newErrors.email = 'Email is required';
    if (!shippingInfo.address) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.state) newErrors.state = 'State is required';
    if (!shippingInfo.postalCode) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();

      const billingAddress = billingInfo.sameAsShipping
        ? {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country,
          }
        : billingInfo;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total,
          shipping_address: shippingInfo,
          billing_address: billingAddress,
          notes: paymentMethod === 'cod' ? 'Payment Method: Cash on Delivery' : 'Payment Method: eSewa',
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      if (order) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product.name,
          size_label: item.size?.size_label || '',
          color_name: item.color?.color_name || '',
          quantity: item.quantity,
          unit_price: item.product.sale_price || item.product.base_price,
          total_price:
            (item.product.sale_price || item.product.base_price) * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        await clearCart();

        setStep(3);
      }
    } catch (error) {
      console.error('Order error:', error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          <div className="flex items-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="font-medium text-gray-700">Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="font-medium text-gray-700">Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="font-medium text-gray-700">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>

                {addresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Addresses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setShippingInfo({
                              ...shippingInfo,
                              address: addr.address_line_1,
                              city: addr.city,
                              state: addr.state || '',
                              postalCode: addr.postal_code || '',
                              country: addr.country,
                              phone: addr.phone || '',
                            });
                            showToast('Address applied', 'success');
                          }}
                          className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors hover:bg-blue-50/30"
                        >
                          <div className="font-semibold text-gray-900 mb-1">{addr.title}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {addr.address_line_1}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Or enter a new address:</h3>
                    </div>
                  </div>
                )}

                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                      }
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                      }
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, email: e.target.value })
                      }
                      error={errors.email}
                      required
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, phone: e.target.value })
                      }
                    />
                  </div>

                  <Input
                    label="Address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    error={errors.address}
                    required
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      error={errors.city}
                      required
                    />
                    <Input
                      label="State"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, state: e.target.value })
                      }
                      error={errors.state}
                      required
                    />
                    <Input
                      label="Postal Code"
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                      }
                      error={errors.postalCode}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                <div className="space-y-6">
                  {isRetailOnly && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <label className={`flex-1 border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${paymentMethod === 'cod' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                        <div className={`w-6 h-6 flex items-center justify-center font-bold text-lg ${paymentMethod === 'cod' ? 'text-gray-900' : 'text-gray-500'}`}>$</div>
                        <span className={`font-medium ${paymentMethod === 'cod' ? 'text-gray-900' : 'text-gray-600'}`}>Cash on Delivery</span>
                      </label>
                      <label className={`flex-1 border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${paymentMethod === 'esewa' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="esewa" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} className="sr-only" />
                        <div className="h-6 flex items-center justify-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Esewa_logo.webp" alt="eSewa" className="h-full object-contain" />
                        </div>
                        <span className={`font-medium ${paymentMethod === 'esewa' ? 'text-gray-900' : 'text-gray-600'}`}>eSewa</span>
                      </label>
                    </div>
                  )}

                  {!isRetailOnly && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                      <p className="text-yellow-800 text-sm">Wholesale orders must be processed via eSewa or direct inquiry.</p>
                    </div>
                  )}

                  {paymentMethod === 'esewa' && (
                    <div className="border border-green-200 bg-green-50 rounded-lg p-6 text-center">
                      <div className="h-12 flex items-center justify-center mx-auto mb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Esewa_logo.webp" alt="eSewa Logo" className="h-full object-contain" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">eSewa Payment</h3>
                      <p className="text-gray-600 font-medium">Coming soon!</p>
                      <p className="text-sm text-gray-500 mt-2">Integration with eSewa is currently under development.</p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-700 font-medium">You will pay {formatPrice(total)} in cash upon delivery.</p>
                      <p className="text-sm text-gray-500 mt-2">Please have the exact amount ready.</p>
                    </div>
                  )}

                  {paymentMethod === 'esewa' && (
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={billingInfo.sameAsShipping}
                          onChange={(e) =>
                            setBillingInfo({ ...billingInfo, sameAsShipping: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-gray-700">Billing address same as shipping</span>
                      </label>
                    </div>
                  )}

                  <Button
                    onClick={handlePlaceOrder}
                    size="lg"
                    className="w-full"
                    disabled={loading || paymentMethod === 'esewa'}
                  >
                    {loading ? <Loading /> : paymentMethod === 'esewa' ? 'Coming Soon' : 'Place Order'}
                  </Button>

                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Placed Successfully!
                </h2>
                <p className="text-gray-600 mb-8">
                  Thank you for your purchase. You will receive an email confirmation shortly.
                </p>
                <Link to="/orders">
                  <Button size="lg">View Orders</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.size?.size_label} / {item.color?.color_name}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold text-gray-900 text-sm mt-1">
                        {formatPrice(
                          (item.product.sale_price || item.product.base_price) *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
