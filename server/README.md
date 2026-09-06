# UniConnect RESTful API Backend

Backend RESTful API service for the **UniConnect** platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Architecture Pattern
- **Pattern:** Controller-Service-Repository (Data Access)
- **Base URL:** `/api/v1`
- **Authentication:** Stateless Bearer JWT with session revocation checks (`BR-007`)
- **Error Handling:** Standardized error envelopes with global error code taxonomy

## Subsystems & Modules
1. `modules/auth/`: Registration, Email Verification (24h), Login, Password Recovery (`API-AUTH-01..06`)
2. `modules/profile/`: Profile CRUD, Dynamic Completeness (`BR-001`), Skills/Courses (`API-PROF-01..07`)
3. `modules/project-match/`: Vacancies, Applications, Resolution & Chat Unlock (`API-PM-01..08`)
4. `modules/study-buddy/`: Requests, Connections, Resolution & Chat Unlock (`API-SB-01..07`)
5. `modules/skill-exchange/`: Listings, Proposals, Resolution & Chat Unlock (`API-SE-01..07`)
6. `modules/chat/`: Active Threads, History, 1000 char Message Streams (`API-CHAT-01..03`)
7. `modules/notifications/`: Alerts, Unread Counter, Read-all (`API-NOTIF-01..03`)
8. `modules/admin/`: Analytics, Account Moderation (`BR-007`), Soft Removal (`API-ADM-01..06`)
