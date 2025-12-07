import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './PayPalCheckout.css';

const PayPalCheckout = ({ planId, planName, amount }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayPalPayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create PayPal order
            const orderData = await window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            description: `KolayDugun ${planName} Subscription`,
                            amount: {
                                currency_code: 'EUR',
                                value: amount.toFixed(2)
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    // Capture the payment
                    const details = await actions.order.capture();

                    // Save transaction to database
                    await handlePaymentSuccess(details);
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                    setError('Payment failed. Please try again.');
                    setLoading(false);
                }
            }).render('#paypal-button-container');

        } catch (err) {
            console.error('Payment error:', err);
            setError('Failed to initialize payment. Please try again.');
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentDetails) => {
        try {
            // 1. Create subscription record
            const expiresAt = new Date();
            if (planName.includes('Monthly')) {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else if (planName.includes('Yearly')) {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            const { data: subscription, error: subError } = await supabase
                .from('vendor_subscriptions')
                .insert([{
                    vendor_id: user.id,
                    plan_id: planId,
                    status: 'active',
                    expires_at: expiresAt.toISOString(),
                    auto_renew: true
                }])
                .select()
                .single();

            if (subError) throw subError;

            // 2. Create transaction record
            const { error: txError } = await supabase
                .from('subscription_transactions')
                .insert([{
                    subscription_id: subscription.id,
                    vendor_id: user.id,
                    amount: amount,
                    currency: 'EUR',
                    payment_method: 'paypal',
                    payment_id: paymentDetails.id,
                    status: 'completed',
                    metadata: paymentDetails
                }]);

            if (txError) throw txError;

            // 3. Redirect to success page
            navigate('/vendor/dashboard?payment=success');
        } catch (err) {
            console.error('Error saving subscription:', err);
            setError('Payment successful but failed to activate subscription. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="paypal-checkout">
            {error && (
                <div className="payment-error">
                    <p>{error}</p>
                </div>
            )}

            <div id="paypal-button-container"></div>

            {loading && (
                <div className="payment-loading">
                    <div className="spinner"></div>
                    <p>Processing payment...</p>
                </div>
            )}
        </div>
    );
};

export default PayPalCheckout;
