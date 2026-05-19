/**
 * Socket.IO Event Handlers
 * Handles real-time communication features
 */

const logger = require('../utils/logger');

// Store connected users
const connectedUsers = new Map(); // socket.id -> { userId, userName, role, avatar, rooms: [] }
// Store user socket mapping: userId -> Set of socketIds
const userSockets = new Map(); // userId -> Set(socket.id)

const setupSocketHandlers = (io) => {
  // Track online users per room
  const roomUsers = new Map(); // room -> Map(userId -> userInfo)

  io.on('connection', (socket) => {
    logger.info(`🔌 New client connected: ${socket.id}`);

    // ===========================
    // Authentication
    // ===========================
    socket.on('authenticate', (data) => {
      const { userId, userName, role, avatar } = data;

      // Store user info
      connectedUsers.set(socket.id, {
        userId,
        userName,
        role,
        avatar: avatar || null,
        rooms: [],
        connectedAt: new Date(),
      });

      // Track user socket mapping (user might have multiple connections)
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join user's personal room for direct notifications
      socket.join(`user-${userId}`);

      // Join role-based room
      socket.join(`role-${role}`);

      // Confirm authentication
      socket.emit('authenticated', {
        success: true,
        userId,
        socketId: socket.id,
      });

      // Broadcast online users to all
      io.emit('users-online', Array.from(connectedUsers.values()));

      logger.info(`✅ User authenticated: ${userName} (${role})`);
    });

    // ===========================
    // Room Management
    // ===========================
    socket.on('join-room', (data) => {
      const { room, userId, userName } = data;

      // Join the room
      socket.join(room);

      // Track users in room
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Map());
      }
      roomUsers.get(room).set(userId, {
        userId,
        userName,
        socketId: socket.id,
        joinedAt: new Date(),
      });

      // Update user's room list
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo && !userInfo.rooms.includes(room)) {
        userInfo.rooms.push(room);
      }

      // Notify others in room
      socket.to(room).emit('user-joined', {
        userId,
        userName,
        room,
        timestamp: new Date(),
        usersInRoom: Array.from(roomUsers.get(room).values()),
      });

      // Send current users in room to the new joiner
      socket.emit('room-users', {
        room,
        users: Array.from(roomUsers.get(room).values()),
      });

      logger.info(`👤 User ${userName} joined room: ${room}`);
    });

    socket.on('leave-room', (data) => {
      const { room, userId, userName } = data;

      // Leave the room
      socket.leave(room);

      // Remove from room tracking
      if (roomUsers.has(room)) {
        roomUsers.get(room).delete(userId);
        if (roomUsers.get(room).size === 0) {
          roomUsers.delete(room);
        }
      }

      // Update user's room list
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        userInfo.rooms = userInfo.rooms.filter(r => r !== room);
      }

      // Notify others
      socket.to(room).emit('user-left', {
        userId,
        userName,
        room,
        timestamp: new Date(),
        usersInRoom: roomUsers.has(room)
          ? Array.from(roomUsers.get(room).values())
          : [],
      });

      logger.info(`👋 User ${userName} left room: ${room}`);
    });

    // ===========================
    // Messaging
    // ===========================
    socket.on('send-message', async (data) => {
      const { room, senderId, senderName, message, messageType = 'text' } = data;

      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room,
        senderId,
        senderName,
        message,
        messageType,
        timestamp: new Date(),
        status: 'sent',
      };

      // Broadcast to room
      io.to(room).emit('receive-message', messageData);

      // Optionally save to database (if Message model is available)
      // try {
      //   const Message = require('../models/Message');
      //   await Message.create({ ... });
      // } catch (err) {
      //   logger.warn('Failed to save message to database:', err.message);
      // }

      logger.info(`💬 Message sent in ${room} by ${senderName}`);
    });

    // Private/direct message
    socket.on('send-direct-message', (data) => {
      const { targetUserId, senderId, senderName, message } = data;

      const messageData = {
        id: `dm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        targetUserId,
        senderId,
        senderName,
        message,
        timestamp: new Date(),
        isDirect: true,
      };

      // Send to target user's personal room
      io.to(`user-${targetUserId}`).emit('receive-direct-message', messageData);

      // Also send back to sender for confirmation
      socket.emit('message-sent', { success: true, messageId: messageData.id });

      logger.info(`📨 Direct message from ${senderName} to user ${targetUserId}`);
    });

    // ===========================
    // Typing Indicators
    // ===========================
    socket.on('typing-start', (data) => {
      const { room, userId, userName } = data;
      socket.to(room).emit('user-typing', {
        userId,
        userName,
        isTyping: true,
      });
    });

    socket.on('typing-stop', (data) => {
      const { room, userId, userName } = data;
      socket.to(room).emit('user-typing', {
        userId,
        userName,
        isTyping: false,
      });
    });

    // ===========================
    // Read Receipts
    // ===========================
    socket.on('mark-read', (data) => {
      const { room, userId, messageId } = data;
      io.to(room).emit('message-read', {
        userId,
        messageId,
        readAt: new Date(),
      });
    });

    // ===========================
    // File Sharing
    // ===========================
    socket.on('send-file', (data) => {
      const { room, senderId, senderName, fileName, fileUrl, fileSize, fileType } = data;

      const fileData = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room,
        senderId,
        senderName,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        timestamp: new Date(),
      };

      io.to(room).emit('receive-file', fileData);
      logger.info(`📎 File shared in ${room}: ${fileName}`);
    });

    // File upload progress (for large files)
    socket.on('file-upload-start', (data) => {
      const { room, fileName, fileSize, uploadId } = data;
      socket.to(room).emit('file-upload-progress', {
        uploadId,
        fileName,
        fileSize,
        progress: 0,
        status: 'uploading',
      });
    });

    socket.on('file-upload-progress', (data) => {
      const { room, uploadId, progress } = data;
      socket.to(room).emit('file-upload-progress', {
        uploadId,
        progress,
        status: progress >= 100 ? 'complete' : 'uploading',
      });
    });

    // ===========================
    // Notifications
    // ===========================
    socket.on('send-notification', (data) => {
      const { targetUserId, targetRoom, type, title, message, metadata } = data;

      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        message,
        metadata,
        timestamp: new Date(),
        read: false,
      };

      if (targetUserId) {
        // Send to specific user
        io.to(`user-${targetUserId}`).emit('notification', notification);
      } else if (targetRoom) {
        // Send to room
        io.to(targetRoom).emit('notification', notification);
      } else {
        // Broadcast to all
        io.emit('notification', notification);
      }
    });

    // ===========================
    // Academic Events
    // ===========================
    socket.on('grade-updated', (data) => {
      const { studentId, classId, grade, updatedBy, assessmentName } = data;

      io.to(`user-${studentId}`).emit('grade-update', {
        classId,
        grade,
        assessmentName,
        updatedBy,
        timestamp: new Date(),
      });

      logger.info(`📊 Grade updated for student ${studentId} in class ${classId}`);
    });

    socket.on('class-announcement', (data) => {
      const { classId, title, content, priority = 'normal', senderName } = data;

      io.to(`class-${classId}`).emit('announcement', {
        classId,
        title,
        content,
        priority,
        senderName,
        timestamp: new Date(),
      });

      // Also notify teachers
      io.to('role-teacher').emit('announcement', {
        classId,
        title,
        content,
        priority,
        senderName,
        timestamp: new Date(),
        isAdminAnnouncement: true,
      });

      logger.info(`📢 Announcement posted to class ${classId}`);
    });

    // Assignment notifications
    socket.on('assignment-created', (data) => {
      const { classId, assignmentTitle, dueDate, studentIds } = data;

      // Notify all students in class
      io.to(`class-${classId}`).emit('new-assignment', {
        classId,
        assignmentTitle,
        dueDate,
        timestamp: new Date(),
      });
    });

    // ===========================
    // Presence & Status
    // ===========================
    socket.on('set-status', (data) => {
      const { userId, status } = data;
      const userInfo = connectedUsers.get(socket.id);

      if (userInfo) {
        userInfo.status = status;
        io.emit('user-status-changed', { userId, status });
      }
    });

    // Get online users in a specific room
    socket.on('get-room-users', (data) => {
      const { room } = data;
      const users = roomUsers.has(room)
        ? Array.from(roomUsers.get(room).values())
        : [];
      socket.emit('room-users', { room, users });
    });

    // ===========================
    // Disconnect
    // ===========================
    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);

      if (userInfo) {
        const { userId, userName, rooms } = userInfo;

        // Remove from userSockets map
        if (userSockets.has(userId)) {
          userSockets.get(userId).delete(socket.id);
          if (userSockets.get(userId).size === 0) {
            userSockets.delete(userId);
          }
        }

        // Remove from all rooms
        rooms.forEach(room => {
          if (roomUsers.has(room)) {
            roomUsers.get(room).delete(userId);
            socket.to(room).emit('user-left', {
              userId,
              userName,
              room,
              timestamp: new Date(),
              usersInRoom: Array.from(roomUsers.get(room).values()),
            });
          }
        });

        logger.info(`❌ Client disconnected: ${userName} (${socket.id})`);
      } else {
        logger.info(`❌ Client disconnected: ${socket.id}`);
      }

      connectedUsers.delete(socket.id);

      // Broadcast updated online users
      io.emit('users-online', Array.from(connectedUsers.values()));
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error (${socket.id}):`, error);
    });
  });

  // Helper functions exposed to the app
  io.getConnectedUsers = () => Array.from(connectedUsers.values());
  io.getUserSockets = (userId) => userSockets.has(userId)
    ? Array.from(userSockets.get(userId))
    : [];
  io.sendToUser = (userId, event, data) => {
    io.to(`user-${userId}`).emit(event, data);
  };
  io.sendToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
  };
  io.broadcast = (event, data) => {
    io.emit(event, data);
  };

  return io;
};

module.exports = { setupSocketHandlers };