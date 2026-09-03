# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a potential security vulnerability within Dolphin Merchant Services, please report it privately to our security team.

**Do not report vulnerabilities through public GitHub issues or forums.**

### Contact
- **Email:** security@godms.com (or sales@godms.com)
- **Response Time:** We acknowledge reports within 24 business hours and provide remediation status updates.

### What to Include
- Detailed description of the issue
- Steps to reproduce or proof-of-concept
- Affected pages, endpoints, or components
- Potential impact and recommended mitigations

## Security Architecture & Defenses

1. **Anti-Bot & Form Flood Protection:** Multi-layer time-delta tokens, dual invisible honeypots, disposable email blacklisting, and sliding-window rate limiters.
2. **HTTP Security Headers:** Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.
3. **Sensitive Data Redaction:** Automated recursive sanitization on server log outputs to prevent PII, credit card, or banking credential leakage.
4. **Session Security:** Automatic 30-minute inactivity timeouts with safe profile sanitization.
5. **Continuous Auditing:** Zero-vulnerability dependency policies across root and API services.
