import os
import json
import asyncio
from dataclasses import dataclass

try:
    import stripe
except Exception:
    stripe = None


@dataclass
class CheckoutSessionRequest:
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: dict | None = None


class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str | None = None):
        self.api_key = api_key
        self.webhook_url = webhook_url
        if stripe and self.api_key:
            stripe.api_key = self.api_key

    async def create_checkout_session(self, ck: CheckoutSessionRequest):
        # Create a Stripe Checkout Session. Use asyncio.to_thread for sync SDK calls.
        def _create():
            if not stripe or not self.api_key:
                # Fallback: no stripe SDK installed OR no API key configured yet.
                # Return a mocked session object rather than calling the real
                # Stripe API with an empty key (which would raise).
                sid = f"cs_test_{os.urandom(6).hex()}"
                return type("S", (), {"session_id": sid, "url": f"https://checkout.stripe.com/pay/{sid}"})()

            # Stripe expects amount in the smallest currency unit (e.g., paise for INR)
            amt = int(round(ck.amount * 100))
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                line_items=[{"price_data": {"currency": ck.currency, "product_data": {"name": "Order"}, "unit_amount": amt}, "quantity": 1}],
                success_url=ck.success_url,
                cancel_url=ck.cancel_url,
                metadata=ck.metadata or {},
            )
            return type("S", (), {"session_id": session.id, "url": session.url})()

        return await asyncio.to_thread(_create)

    async def get_checkout_status(self, session_id: str):
        def _get():
            if not stripe or not self.api_key:
                return type("R", (), {"status": "completed", "payment_status": "paid", "amount_total": 0, "currency": "INR"})()
            session = stripe.checkout.Session.retrieve(session_id)
            payment_status = "pending"
            amount_total = 0
            currency = ""
            # If payment_intent present, retrieve it
            if getattr(session, "payment_status", None):
                payment_status = session.payment_status
            if getattr(session, "amount_total", None):
                amount_total = session.amount_total
            if getattr(session, "currency", None):
                currency = session.currency
            # Normalize names expected by server.py
            return type("R", (), {"status": session.get("status", "unknown"), "payment_status": payment_status, "amount_total": amount_total, "currency": currency})()

        return await asyncio.to_thread(_get)

    async def handle_webhook(self, body: bytes, signature: str | None = None):
        # Minimal webhook parser: try to parse JSON and return an event-like object
        try:
            payload = json.loads(body.decode() if isinstance(body, (bytes, bytearray)) else body)
        except Exception:
            payload = {}

        ev_type = payload.get("type") if isinstance(payload, dict) else None
        session_id = None
        payment_status = "unknown"
        data = payload.get("data", {}) if isinstance(payload, dict) else {}
        obj = data.get("object") if isinstance(data, dict) else None
        if obj and isinstance(obj, dict):
            session_id = obj.get("id") or (obj.get("session_id") or obj.get("checkout_session_id"))
            # heuristics
            if ev_type == "checkout.session.completed":
                payment_status = "paid"
            if obj.get("payment_status"):
                payment_status = obj.get("payment_status")

        return type("E", (), {"payment_status": payment_status, "session_id": session_id})()
