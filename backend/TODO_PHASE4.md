# Backend Phase 4: Funcionalidades Avançadas Tracker

## Status: 🚀 STARTED (Plan Approved)

### Prerequisites
- [ ] Message model migrated (sequelize.sync)

### 1. Dependencies ✅ COMPLETE (pdfkit installed for reports)
```
cd backend
npm i pdfkit
npm i -D @types/pdfkit
```

### 2. Message Model [PENDING]
- src/models/Message.js (classId/roomId, userId, content, timestamp)
- Associations: belongsTo Class, User

### 3. Chat Controller & Routes ✅ COMPLETE (fixed db include User)
- src/controllers/chatController.js (getMessages(classId), sendMessage)
- src/routes/chat.js (GET/POST /api/chat/:classId/messages page/limit)

### 4. Update Socket.io server.js [PENDING]
- on 'send-message': validate auth, save DB, emit 'receive-message' room
- on 'join-room': emit past 50 messages

### 5. Real-time Notifications [PENDING]
- gradeController addGrade: io.to(student.class.rooms?).emit('new-grade')
- documentController upload: emit 'new-document' class room

### 6. Reports Enhancement [PENDING]
- gradeController exportPDF (pdfkit base64 response)

### 7. Update Postman [PENDING]
- Chat endpoints
- Export PDF test

### 8. Validation [COMPLETE after tests]

**Priority:** 1.Chat > 2.Notifications > 3.Reports (skip gamification/integrations MVP)

**Next:** Install deps → Message model.
