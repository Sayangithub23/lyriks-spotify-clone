import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import { Database } from "@/types_db";
import { Price, Product } from "@/types";
import { stripe } from "./stripe";
import { toDateTime } from "./helpers";

// Initialize Supabase client with service role key
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Upsert product record in Supabase
const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  const { error } = await supabaseAdmin.from("products").upsert([productData]);
  if (error) {
    throw new Error(`Failed to upsert product ${product.id}: ${error.message}`);
  }
  console.log(`Product inserted/updated: ${product.id} - ${product.name}`);
};

// Upsert price record in Supabase
const upsertPriceRecord = async (price: Stripe.Price) => {
  // Fix: Handle cases where price.product could be a string, Product object, or null
  const productId = typeof price.product === "string" ? price.product : price.product?.id ?? "";

  const priceData: Price = {
    id: price.id,
    product_id: productId,
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval ?? undefined,
    interval_count: price.recurring?.interval_count ?? undefined,
    trial_period_days: price.recurring?.trial_period_days ?? undefined,
    metadata: price.metadata,
  };

  const { error } = await supabaseAdmin.from("prices").upsert([priceData]);
  if (error) {
    throw new Error(`Failed to upsert price ${price.id}: ${error.message}`);
  }
  console.log(`Price inserted/updated: ${price.id} - ${productId} - ${price.unit_amount}`);
};

// Create or retrieve a Stripe customer
const createOrRetrieveCustomer = async ({
  uuid,
  email,
}: {
  uuid: string;
  email: string;
}) => {
  // Fix: Add validation for uuid and email
  if (!uuid) {
    throw new Error("UUID is required to create or retrieve customer");
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("stripe_customer_id")
    .eq("id", uuid)
    .single();

  if (error || !data?.stripe_customer_id) {
    console.log(`No customer found for UUID ${uuid}, creating new one...`);
    const customerData: { metadata: { supabaseUUID: string }; email?: string } = {
      metadata: { supabaseUUID: uuid },
    };
    if (email) customerData.email = email;

    const customer = await stripe.customers.create(customerData);
    const { error: supabaseError } = await supabaseAdmin
      .from("customers")
      .insert([{ id: uuid, stripe_customer_id: customer.id }]);

    if (supabaseError) {
      throw new Error(`Failed to insert customer for UUID ${uuid}: ${supabaseError.message}`);
    }

    console.log(`New customer created and inserted for ${uuid} - ${customer.id}`);
    return customer.id;
  }

  return data.stripe_customer_id;
};

// Update customer billing details
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod | null
) => {
  if (!uuid) {
    throw new Error("UUID is required to update billing details");
  }

  if (!payment_method) {
    console.warn("No payment method provided; skipping billing update.");
    return;
  }

  // Fix: Safely handle customer as string or null
  const customerId = typeof payment_method.customer === "string" ? payment_method.customer : null;
  if (!customerId) {
    throw new Error("Payment method does not have a valid customer ID");
  }

  const { name, phone, address } = payment_method.billing_details ?? {};

  // Skip update if no relevant billing details are provided
  if (!name && !phone && !address) {
    console.warn("No billing details provided; skipping update.");
    return;
  }

  // Prepare address for Stripe update
  const addressParam: Stripe.AddressParam | undefined = address
    ? {
        city: address.city ?? undefined,
        country: address.country ?? undefined,
        line1: address.line1 ?? undefined,
        line2: address.line2 ?? undefined,
        postal_code: address.postal_code ?? undefined,
        state: address.state ?? undefined,
      }
    : undefined;

  // Update Stripe customer
  await stripe.customers.update(customerId, {
    name: name ?? undefined,
    phone: phone ?? undefined,
    address: addressParam,
  });

  // Prepare billing address for Supabase
  const billingAddressForSupabase = address ? { ...address } : undefined;

  // Fix: Safely extract payment method details
  const paymentMethodType = payment_method.type as keyof Stripe.PaymentMethod;
  const paymentMethodDetails = payment_method[paymentMethodType];
  const safePaymentMethod =
    paymentMethodDetails && typeof paymentMethodDetails === "object"
      ? JSON.parse(JSON.stringify(paymentMethodDetails)) // Ensure serializable
      : undefined;

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      billing_address: billingAddressForSupabase,
      payment_method: safePaymentMethod,
    })
    .eq("id", uuid);

  if (error) {
    throw new Error(`Failed to update billing details for UUID ${uuid}: ${error.message}`);
  }
};

// Manage subscription status changes
const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Fix: Validate inputs
  if (!subscriptionId || !customerId) {
    throw new Error("Subscription ID and customer ID are required");
  }

  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (noCustomerError || !customerData) {
    throw new Error(`Customer not found for ID ${customerId}: ${noCustomerError?.message}`);
  }

  const { id: uuid } = customerData;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  // Fix: Safely access price_id with fallback
  const priceId = subscription.items.data[0]?.price.id ?? null;

  // Fix: Streamline subscriptionData with consistent null handling
  const subscriptionData = {
    id: subscription.id,
    user_id: uuid,
    status: subscription.status,
    price_id: priceId,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at)?.toISOString() ?? null
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at)?.toISOString() ?? null
      : null,
    current_period_start: subscription.current_period_start
      ? toDateTime(subscription.current_period_start)?.toISOString() ?? null
      : null,
    current_period_end: subscription.current_period_end
      ? toDateTime(subscription.current_period_end)?.toISOString() ?? null
      : null,
    created: subscription.created
      ? toDateTime(subscription.created)?.toISOString() ?? null
      : null,
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at)?.toISOString() ?? null
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start)?.toISOString() ?? null
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end)?.toISOString() ?? null
      : null,
  };

  const { error: upsertError } = await supabaseAdmin
    .from("subscriptions")
    .upsert([subscriptionData]);

  if (upsertError) {
    throw new Error(`Failed to upsert subscription ${subscription.id}: ${upsertError.message}`);
  }

  console.log(`Subscription inserted/updated: ${subscription.id} for user ${uuid}`);

  // Fix: Safely cast default_payment_method
  if (createAction && subscription.default_payment_method) {
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  createOrRetrieveCustomer,
  copyBillingDetailsToCustomer,
  manageSubscriptionStatusChange,
};