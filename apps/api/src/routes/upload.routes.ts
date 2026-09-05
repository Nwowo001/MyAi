/**
 * @fileoverview File upload routes.
 */

import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const uploadRouter = Router();

uploadRouter.post('/image', requireAuth, uploadImage);
