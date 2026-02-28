# **KHOJ** — Lost and Found Web Application

---

## Team Members

| Roll | Name | Email |
|------|------|-------|
| 20230104040 | Kazi Ishmamul Haque | kaziishmamulhaque@gmail.com |
| 20230104039 | Faiyaz Fardin | faiyazfardin07@gmail.com |
| 20230104031 | Shoaib Mughdo | shoaibmugdho31@gmail.com |

---

## Project Overview

### Project Title  
**KHOJ – Lost and Found Management System**

### Objective  
The main goal of **KHOJ** is to create an online platform where people can easily report lost or found items and increase the chances of recovering them. Instead of depending on social media posts or manual searching, the system provides a structured database supported by intelligent search features.

### Target Audience  
- University students and staff  
- General users who lose or find items  
- Campus or organization administrators  

---

## Technology Stack

### Backend
- Laravel (PHP)

### Frontend
- React.js  
- HTML, CSS, JavaScript  

### Database
- Microsoft SQL Server (MSSQL)

### AI Integration
- Google Gemini API for intelligent item searching

### Rendering Method
- Client-Side Rendering (CSR)

---

## Project Category

This project falls under the following categories:

- Productivity system for organizing lost and found records  
- Social impact application to assist people in recovering belongings  
- AI-assisted decision support system using intelligent search  

---

## KHOJ Figma Design

[**View KHOJ Web App Design**](https://khoj-demo.figma.site/)

---

## Key Features

### User Features
- User registration and login  
- Post lost items with description and images  
- Post found items  
- Search items from the database  
- Claim an item if it belongs to the user  
- Report suspicious or invalid posts  

### Admin Features
- View reported posts    
- Remove fake or misleading posts  

### AI-Based Features
- Natural language item search using Gemini AI  

### Authentication
- JWT-based authentication  
- Role-based access control (user and admin)  

### Data Operations
- Full CRUD operations for:
  - Lost items  
  - Found items  
  - Claims  
  - Reports  

---

## API Endpoints (Planned)

### Authentication
- `POST /api/register`  
- `POST /api/login`  

### Item Management
- `POST /api/items`  
- `GET /api/items`  
- `GET /api/items/{id}`  
- `PUT /api/items/{id}`  
- `DELETE /api/items/{id}`  

### Claims & Reports
- `POST /api/claims`  
- `GET /api/claims`  
- `POST /api/reports`  

### AI Search
- `POST /api/ai/search`  

---

## Project Milestones

### Milestone 1 — Planning & Setup
- Requirement analysis  
- Database design using MSSQL  
- Laravel backend setup  
- Authentication system  
- Initial UI wireframes  

### Milestone 2 — Core System Development
- Lost and found posting system  
- Claim functionality  
- Search using database queries  
- Admin dashboard  
- Report handling system  

### Milestone 3 — AI Integration & Finalization
- Integration of Gemini AI  
- AI-powered intelligent search  


---

## Conclusion

**KHOJ** is a web-based lost and found management system designed to simplify item recovery through organized data handling and AI-assisted searching. By combining database-driven logic with intelligent assistance, the platform aims to provide a reliable and socially beneficial solution for everyday item recovery problems.

---