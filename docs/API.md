# AutoAgent API Documentation Overview

The AutoAgent Express API server exposes endpoints for authentication, tenant business management, offerings, customers, conversations, bookings, orders, payments, knowledge bases, AI interaction, and external webhooks.

---

## Base URL & Headers

- **Base URL**: `http://localhost:4000/api`
- **Health Endpoint**: `GET /health`

### Common Headers

| Header | Description | Required |
| shadow | ------------ | -------- |
| `Authorization` | `Bearer <SUPABASE_JWT_TOKEN>` | Yes (for protected endpoints) |
| `X-Business-ID` | Target tenant business UUID | Yes (for business-scoped endpoints) |
| `Content-Type` | `application/json` | Yes (for POST/PUT/PATCH body payloads) |

---

## Standard Response Format

All API responses follow a unified response structure:

### Success Response (`200 OK`, `201 Created`)

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `422`, `500`)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

---

## Route Modules Summary

### 1. System & Health
- `GET /health` — Service health check & environment metadata.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new business owner.
- `POST /api/auth/login` — Login user.
- `GET /api/auth/me` — Get active session user profile.

### 3. Business Tenant (`/api/business`)
- `GET /api/business` — List businesses owned by active user.
- `POST /api/business` — Create a new business profile.
- `GET /api/business/:businessId` — Get business settings & details.
- `PATCH /api/business/:businessId` — Update business settings, operating hours, currency.

### 4. Offerings Catalog (`/api/business/:businessId/offerings`)
- `GET /api/business/:businessId/offerings` — List products & services.
- `POST /api/business/:businessId/offerings` — Create product or service.
- `GET /api/business/:businessId/offerings/:offeringId` — Get single offering details.
- `PATCH /api/business/:businessId/offerings/:offeringId` — Update offering.
- `DELETE /api/business/:businessId/offerings/:offeringId` — Archive/delete offering.

### 5. Customers & Leads (`/api/business/:businessId/customers`)
- `GET /api/business/:businessId/customers` — List customers with pagination & search.
- `GET /api/business/:businessId/customers/:customerId` — Get customer profile & interaction history.

### 6. Conversations & Human Handover (`/api/business/:businessId/conversations`)
- `GET /api/business/:businessId/conversations` — List active conversations (filterable by channel, status).
- `GET /api/business/:businessId/conversations/:conversationId/messages` — Fetch message history.
- `POST /api/business/:businessId/conversations/:conversationId/messages` — Human agent reply.
- `POST /api/business/:businessId/conversations/:conversationId/takeover` — Take over conversation from AI.
- `POST /api/business/:businessId/conversations/:conversationId/resume-ai` — Hand conversation back to AI.

### 7. Bookings (`/api/business/:businessId/bookings`)
- `GET /api/business/:businessId/bookings` — List bookings.
- `POST /api/business/:businessId/bookings` — Create a manual booking.
- `PATCH /api/business/:businessId/bookings/:bookingId/status` — Update booking status.

### 8. Orders & Payments (`/api/business/:businessId/orders`)
- `GET /api/business/:businessId/orders` — List orders.
- `POST /api/business/:businessId/orders` — Create order.
- `POST /api/business/:businessId/payments/link` — Generate payment link via Paystack.

### 9. Webhooks (`/api/webhooks`)
- `GET /api/webhooks/whatsapp` — Meta WhatsApp webhook verification endpoint.
- `POST /api/webhooks/whatsapp` — Meta WhatsApp inbound message & status update handler.
- `POST /api/webhooks/paystack` — Paystack payment status notification listener.
