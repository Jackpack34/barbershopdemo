import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BARBER_EMAILS: Record<string, string> = {
  adam: "adam@royalbarber.pl",
  kacper: "kacper@royalbarber.pl",
  michal: "michal@royalbarber.pl",
};

interface BookingData {
  clientEmail: string;
  serviceName: string;
  barberName: string;
  barberId: string;
  date: string;
  time: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const booking: BookingData = await req.json();

    // Email to client
    const clientEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Royal Barber <onboarding@resend.dev>",
        to: [booking.clientEmail],
        subject: "Potwierdzenie rezerwacji — Royal Barber",
        html: `
          <h2>Potwierdzenie rezerwacji</h2>
          <p>Dziękujemy za rezerwację w Royal Barber!</p>
          <table style="border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;font-weight:bold">Usługa:</td><td style="padding:8px">${booking.serviceName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Barber:</td><td style="padding:8px">${booking.barberName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Data:</td><td style="padding:8px">${booking.date}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Godzina:</td><td style="padding:8px">${booking.time}</td></tr>
          </table>
          <p>Do zobaczenia!</p>
        `,
      }),
    });

    if (!clientEmail.ok) {
      const err = await clientEmail.text();
      console.error("Client email error:", err);
    }

    // Email to barber
    const barberEmail = BARBER_EMAILS[booking.barberId];
    if (barberEmail) {
      const barberRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Royal Barber <onboarding@resend.dev>",
          to: [barberEmail],
          subject: `Nowa rezerwacja — ${booking.date} o ${booking.time}`,
          html: `
            <h2>Nowa rezerwacja</h2>
            <table style="border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;font-weight:bold">Usługa:</td><td style="padding:8px">${booking.serviceName}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Klient:</td><td style="padding:8px">${booking.clientEmail}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Data:</td><td style="padding:8px">${booking.date}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Godzina:</td><td style="padding:8px">${booking.time}</td></tr>
            </table>
          `,
        }),
      });

      if (!barberRes.ok) {
        const err = await barberRes.text();
        console.error("Barber email error:", err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
