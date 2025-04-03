# Secure Post Publisher

A **Next.js** web application focused on **secure post publishing** with author verification. It includes **server-side session storage**, **data validation**, **input sanitization**, and **data encryption**, making it ideal for learning and demonstrating best practices in web application security.

## 🔐 Features

- ✅ User Registration with password strength feedback
- ✅ User Login with 2FA verification
- ✅ Two-Factor Authentication (TOTP-based) setup
- ✅ Server-side Session Storage using secure cookies
- ✅ Password Change functionality
- ✅ Post creation with digital signatures
- ✅ Signature verification for authorship validation
- ✅ Input sanitization and validation
- ✅ Encryption for sensitive data

---

## 🖼️ Screenshots

### 🔑 Login Page

_Basic login form with email/password fields_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/1.png?raw=true" alt="Login Page" width="400"/>
</p>

### 📝 Registration – Weak Password

_Shows warning for weak password input_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/2.png?raw=true" alt="Weak Password Registration" width="400"/>
</p>

### 📝 Registration – Strong Password

_Successful registration with strong password_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/3.png?raw=true" alt="Strong Password Registration" width="400"/>
</p>

### ❌ Incorrect Password

_Error displayed on wrong login credentials_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/4.png?raw=true" alt="Incorrect Password" width="400"/>
</p>

### 🔐 2FA Setup

_QR code for TOTP apps like Google Authenticator_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/5.png?raw=true" alt="2FA Setup" width="400"/>
</p>

### ✅ Signed Post

_Post verified and marked with signature_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/6.png?raw=true" alt="Signed Post" width="400"/>
</p>

### 🗒️ Unsigned Post

_Example of an unsigned post_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/7.png?raw=true" alt="Unsigned Post" width="400"/>
</p>

### ✍️ Signing a Post

_User signs post using cryptographic keys_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/8.png?raw=true" alt="Signing a Post" width="400"/>
</p>

### 🔁 Change Password

_Interface to update current password_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/9.png?raw=true" alt="Change Password" width="400"/>
</p>

### 🔄 2FA Verification After Login

_Prompt for 2FA code on secure re-login_

<p align="center">
  <img src="https://github.com/Kobumbo/images/blob/main/secure_posting_app/10.png?raw=true" alt="2FA Verification After Login" width="400"/>
</p>

---

## 🧰 Tech Stack

- **Next.js**
- **Tailwind CSS** – UI styling
- **Prisma** – Database ORM
- **Zod** – Schema-based validation
- **speakeasy** – TOTP generation & verification
- **Crypto** – Data encryption/signing
- **DOMPurify** and **he** – Input sanitization

---

## 🚀 Getting Started

```bash
git clone https://github.com/kobumbo/secure_post_publisher.git
cd secure_post_publisher
npx prisma migrate dev --name init
docker-compose up --build -d
```
