# Principle
```markdown
<type>(<scope>): <mô tả ngắn>

<nội dung chi tiết - tùy chọn>

<footer - tùy chọn>
```

Các type thường dùng
- feat: thêm tính năng mới
- fix: sửa lỗi
- docs: chỉ sửa tài liệu
- style: định dạng code (không đổi logic)
- refactor: viết lại code, không thêm tính năng hay sửa lỗi
- test: thêm/sửa test
- chore: việc vặt (cập nhật dependency, config, build)
- perf: cải thiện hiệu năng


Quy tắc viết tốt
- Dòng tiêu đề ngắn, tối đa khoảng 50-72 ký tự.
Dùng thể mệnh lệnh, ví dụ “add”, “fix”, “thêm”, “sửa” thay vì “added”, “đã sửa”.
- Không chấm câu ở cuối dòng tiêu đề.
- Mỗi commit làm một việc (atomic), không gộp nhiều thay đổi không liên quan.
- Cách một dòng trống giữa tiêu đề và phần nội dung.
- Nội dung giải thích “tại sao”, không chỉ “làm gì” (code đã cho thấy làm gì rồi).
Nhất quán ngôn ngữ trong cả dự án tiếng anh