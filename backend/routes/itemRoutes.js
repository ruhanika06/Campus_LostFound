const express = require('express');
const router = express.Router();
const { getAllItems, getItemById, createItem, updateStatus, deleteItem, claimItem, getClaims, getMyClaims, updateClaimStatus } = require('../controllers/itemController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/', getAllItems);
router.get('/claims', verifyToken, verifyRole(['Admin']), getClaims); // Claims list for admin — MUST be before /:id
router.get('/my-claims', verifyToken, getMyClaims); // Logged-in user's own claims — MUST be before /:id
router.get('/:id', getItemById);

router.post('/claim', verifyToken, claimItem); // MUST be before /:id routes
router.post('/', verifyToken, createItem);

router.put('/claim/:id', verifyToken, verifyRole(['Admin']), updateClaimStatus); // Approve/Reject claim
router.put('/:id/status', verifyToken, verifyRole(['Admin']), updateStatus);

router.delete('/:id', verifyToken, deleteItem);

module.exports = router;
