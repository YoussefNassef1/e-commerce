![image](https://github.com/YoussefNassef1/e-commerce/assets/156219183/39c3194a-c526-4cb9-a4d2-2a3d7941aeff)
![image](https://github.com/YoussefNassef1/e-commerce/assets/156219183/b8235af9-3cee-409d-b95e-4e263ec5e7c8)
![image](https://github.com/YoussefNassef1/e-commerce/assets/156219183/cd782362-3bdf-4e9b-bdf7-21ada3d982c2)
![image](https://github.com/YoussefNassef1/e-commerce/assets/156219183/20f6d74b-7868-436f-b516-d47e478fcab0)
![image](https://github.com/YoussefNassef1/e-commerce/assets/156219183/67dc568c-d7cc-452b-b757-ecdfcd3556d0)




### 1. Run
- `npm start` listening on port 3000
- Uses `dotenv` package for environment variables in `.env` file
- Uses `ejs` templating engine
---
### 2. `npm` packages
- `bcryptjs: ^2.4.3`
- `connect-flash: ^0.1.1`
- `connect-mongodb-session: ^2.1.1`
- `csurf: ^1.10.0`
- `dotenv: ^7.0.0`
- `ejs: ^2.6.1`
- `express: ^4.16.4`
- `express-session: ^1.16.1`
- `express-validator: ^5.3.1`
- `helmet: ^3.16.0`
- `mongoose: ^5.5.5`
- `multer: ^1.4.1`
- `nodemailer: ^6.1.1`
- `pdfkit: ^0.9.1`
- `stripe: ^6.31.1`
---
### 4. Section 18 (Validation) Changes:
- Uses `express-validator` package
- Uses validation arrays in `middleware` directory
- Uses `oldInputs` object in views to keep previously entered data
- Uses `valErrs` array in views for conditional css classes
- Sanitizes inputs with `trim()` and `normalizeEmail()` in validators
---
### 5. Section 19 (Error Handling) Changes:
- Creates catch-all error-handling middleware `app.use((err, req, res, next) => {})` with `500` error page
- Changes all `.catch(err => console.log(err));` blocks to `.catch(err => next(err));`
---
### 6. Section 20 (File Upload & Download) Changes:
- Adds image file upload with `multer` package with `enctype="multipart/form-data"` for form
  - Saves uploaded images to `/uploads/images` directory
- Generates invoice PDF files from orders with `pdfkit` package
  - Saves invoice PDFs to `/downloads/invoices` directory
- Requests for previously generated invoices are piped from filesystem
- Image files of deleted products are ***not*** removed from filesystem because they are needed to generate invoices for past orders that may include deleted products
---
### 7. Section 21 (Pagination) Changes:
- Adds pagination to `'/'`, `'/products'`, and `'/admin/products'` routes
---
### 8. Section 22 (Async Requests) Changes:
- Adds client-side JS to delete product by id and directly removing product from DOM (***code included but not used***)
---
### 9. Section 23 (Stripe Payments) Changes:
- Adds payment functionality through Stripe
  - Creates a new checkout page with `Pay with Card` button from Stripe
  - Replaces `create-order` route with `create-checkout` route
    - `create-checkout` route is placed in `app.js` to avoid csrf token error
  - Creates order, submits payment data to Stripe, clears cart, displays orders page
---
