import { Router, Request, Response, NextFunction } from 'express';
import { createInquirySchema } from '../schemas/inquiry.schema.js';
import { DbService } from '../services/db.service.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// POST /api/inquiries - Submit a general or custom travel inquiry
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createInquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors[0]?.message || 'Invalid inquiry form data');
    }

    const inquiry = await DbService.createInquiry(parseResult.data);

    sendSuccess(
      res,
      {
        inquiry: {
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          destination: inquiry.destination,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
        },
      },
      'Your inquiry has been received! Our travel planning experts will get back to you shortly.',
      201
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/inquiries - List submitted inquiries (for admin / dashboard overview)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiries = await DbService.listInquiries();
    sendSuccess(res, { inquiries });
  } catch (error) {
    next(error);
  }
});

export default router;
