const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', verifyToken, listNotifications);
router.patch('/read-all', verifyToken, markAllNotificationsRead);
router.patch('/:id/read', verifyToken, markNotificationRead);

module.exports = router;
