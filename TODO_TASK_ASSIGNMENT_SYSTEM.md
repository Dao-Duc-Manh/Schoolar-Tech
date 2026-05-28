# TODO - Assignment / Submission / Grading System

## Phase 0: Rà soát & chuẩn hóa yêu cầu
- [x] Đối chiếu backend hiện có: Document upload + Grade + route
- [ ] Chuẩn hóa danh sách loại file cho Assignment (ppt/pptx/canvas/pdf)

## Phase 1: MVP (upload file bài nộp trước)
- [ ] Backend: mở rộng Document upload để chấp nhận ppt/pptx
- [ ] Backend: thêm model + migration logic cho `Submission`
- [ ] Backend: thêm routes/controller cho submission
  - student: nộp file (và tạo answerText rỗng tạm thời)
  - teacher: lấy danh sách submissions theo assignment/class
  - teacher: chấm điểm + feedback + ghi nhận gradedAt
- [ ] Backend: (tùy chọn) khi chấm: đồng bộ sang `Grade`
- [ ] Frontend: trang Teacher tạo/upload assignment + list assignment
- [ ] Frontend: trang Student xem assignment + upload file nộp
- [ ] Frontend: trang Teacher xem submission list + chấm

## Phase 2: Nộp trực tiếp trên hệ thống
- [ ] Frontend: thêm editor/textarea để sinh viên nhập bài làm
- [ ] Backend: lưu `answerText` vào Submission

## Phase 3: UI/UX hoàn thiện
- [ ] Thêm trạng thái (đã nộp/chưa nộp/đã chấm)
- [ ] Thêm thông báo qua socket (nếu cần)


