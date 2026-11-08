# GITHUB

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


# Workflow
Tạo thẻ trên board → kéo vào Doing → git switch -c feat/ten-tinh-nang → code + test → PR → CI xanh → merge → kéo sang Done