<!-- Google Analytics Code for Mr.Holmes CRM
Add this to landing.html before </head> tag -->

<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
  
  // Custom Event: Demo Booking
  function trackDemoBooking() {
    gtag('event', 'demo_booking_clicked', {
      'event_category': 'engagement',
      'event_label': 'demo_calendly'
    });
  }
  
  // Custom Event: Trial Signup
  function trackTrialSignup(email) {
    gtag('event', 'trial_signup', {
      'event_category': 'conversion',
      'event_label': email
    });
  }
</script>

<!-- Facebook Pixel (optional) -->
<img height="1" width="1" style="display:none" 
     src="https://www.facebook.com/tr?id=XXXXXXXXXXXXXXXXX&ev=PageView&noscript=1" />

---

## Setup Instructions:

### 1. Google Analytics Setup
1. Go to analytics.google.com
2. Create NEW PROPERTY: "Mr.Holmes CRM"
3. Select "Web" as platform
4. Add website: https://seu-dominio.com (or localhost:8889 for testing)
5. Copy GA4 Measurement ID (G-XXXXXXXXXX)
6. Replace G-XXXXXXXXXX in script above

### 2. Create Events in GA4
Go to Events > Create Event:
- Event 1: "demo_booking_clicked"
- Event 2: "trial_signup"
- Event 3: "pricing_click"

### 3. Setup Conversion Tracking
- Conversion 1: Trial Signup = $0 value (top funnel)
- Conversion 2: Demo Booking = $150 estimated value
- Conversion 3: Purchase = $600-2700 value

### 4. Alerts
Set up alerts for:
- Daily: 10+ new visitors
- Daily: 3+ demo bookings
- Weekly: 10+ trial signups

---

## Testing

1. Go to http://localhost:8889/landing.html
2. Open browser Console (F12)
3. Click buttons, should see GA events firing
4. Check GA4 Real-time (analytics.google.com > Realtime)

