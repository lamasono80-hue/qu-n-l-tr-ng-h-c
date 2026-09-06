import { Router } from 'express';
import { skillController } from './skill.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// 1. API-SE-07: List My Sent Skill Exchange Proposals (Placed before /:id route)
router.get('/responses/me', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  skillController.listMySkillResponses(req, res, next)
);

// 2. API-SE-06: Resolve Skill Proposal (Accept / Decline) (Placed before /:id route)
router.patch('/responses/:responseId', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  skillController.resolveSkillResponse(req, res, next)
);

// 3. API-SE-01: List & Filter Skill Exchange Listings
router.get('/', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  skillController.listSkillListings(req, res, next)
);

// 4. API-SE-03: Create Skill Listing
router.post('/', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  skillController.createSkillListing(req, res, next)
);

// 5. API-SE-02: Get Skill Listing Details
router.get('/:id', authenticate, requireRole(['STUDENT', 'ADMIN']), (req, res, next) =>
  skillController.getSkillListingDetail(req, res, next)
);

// 6. API-SE-04: Close Skill Listing
router.patch('/:id/close', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  skillController.closeSkillListing(req, res, next)
);

// 7. API-SE-05: Send Skill Exchange Proposal
router.post('/:id/respond', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  skillController.respondSkillListing(req, res, next)
);

export const skillExchangeRoutes = router;
