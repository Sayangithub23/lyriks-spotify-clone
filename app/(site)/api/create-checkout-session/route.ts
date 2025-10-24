import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getUrl } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

export async function POST(request: Request) {
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email ?? "",
    });

    const session = await stripe.checkout.sessions.create({
      customer,
      billing_address_collection: "required",
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        metadata, // ✅ keep metadata
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" }, // optional
        },
      },
      success_url: `${getUrl()}/account`,
      cancel_url: `${getUrl()}`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
