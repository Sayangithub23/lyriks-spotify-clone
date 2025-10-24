// app/(site)/api/webhooks/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/libs/stripe";
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
} from "@/libs/supabaseAdmin";

// Only handle these events
const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature") as string;

  const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(` Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Only process relevant events
  if (!relevantEvents.has(event.type)) {
    console.log(`Ignoring irrelevant event type: ${event.type}`);
    return new NextResponse("Ignored", { status: 200 });
  }

  try {
    switch (event.type) {
      case "product.created":
      case "product.updated": {
        const product = event.data.object as Stripe.Product;
        console.log("Processing product event:", product.id);
        await upsertProductRecord(product);
        break;
      }

      case "price.created":
      case "price.updated": {
        const price = event.data.object as Stripe.Price;
        console.log("Processing price event:", price.id);
        await upsertPriceRecord(price);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `Processing subscription event: ${event.type} for subscription ${subscription.id}`
        );
        try {
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
        } catch (err) {
          console.error(" Supabase subscription update failed:", err);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout session:", session.id);

        if (session.mode === "subscription" && session.subscription && session.customer) {
          try {
            await manageSubscriptionStatusChange(
              session.subscription.toString(),
              session.customer.toString(),
              true
            );
          } catch (err) {
            console.error(" Supabase subscription update failed:", err);
          }
        } else {
          console.log(
            "Skipping checkout session because it's not a subscription or missing customer/subscription info",
            session.id
          );
        }
        break;
      }

      default:
        console.warn(` Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(" Webhook handler failed:", err);
    // Return 200 to avoid Stripe retries if signature is valid
    return new NextResponse("Webhook handler failed", { status: 200 });
  }

  return new NextResponse(" Webhook received", { status: 200 });
}
