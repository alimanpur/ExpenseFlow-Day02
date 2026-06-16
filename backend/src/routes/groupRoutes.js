import { Router } from 'express';
import {
  createGroup, updateGroup, deleteGroup,
  listGroups, joinGroup, getGroupDashboardLedger,
  inviteMember, acceptInvite, removeMember
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', listGroups);
router.post('/create', createGroup);
router.post('/join', joinGroup);
router.post('/invites/:token/accept', acceptInvite);

router.get('/:id', getGroupDashboardLedger);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
