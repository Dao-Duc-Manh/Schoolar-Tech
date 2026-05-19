# TODO - RAG AI (OpenAI) cho dự án

## Bước 1: Xác nhận phạm vi
- [x] Backend chưa có route `/api/ai/*`
- [x] Frontend có gọi `/ai/student-chat`, `/ai/generate-study-plan`, `/ai/generate-quiz` (chưa tồn tại backend)
- [ ] Chốt triển khai tối thiểu: `POST /api/ai/student-chat` + RAG trả lời theo tài liệu

## Bước 2: Chuẩn bị cấu hình OpenAI
- [ ] Thêm biến môi trường cần thiết: `OPENAI_API_KEY`, model name
- [ ] Thêm cấu hình gợi ý trong code (fallback nếu thiếu)

## Bước 3: Tạo backend RAG
- [ ] Thêm file `backend/src/routes/ai.js`
- [ ] Thêm file `backend/src/controllers/aiController.js`
- [ ] Thêm file `backend/src/services/ragService.js`

## Bước 4: Cắm routes vào hệ thống
- [ ] Cập nhật `backend/src/routes/index.js` để mount `/api/ai`

## Bước 5: Cài dependencies
- [ ] Cài package OpenAI + embedding/vector store cần thiết

## Bước 6: Test
- [ ] Test endpoint bằng curl/postman
- [ ] Chạy frontend để xác nhận chat hoạt động

