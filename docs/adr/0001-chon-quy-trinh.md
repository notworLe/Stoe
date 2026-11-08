# 0001. Chọn quy trình phát triển

- Trạng thái: Chấp nhận
- Ngày: 2026-11-09

## Bối cảnh
Dự án cá nhân/nhóm nhỏ, hướng ứng dụng thực tế, cần quy trình nhẹ, học nhanh, nâng cấp được.

## Quyết định
Kanban nhẹ (GitHub Projects, tối đa 2 việc Doing) + trunk-based Git (branch ngắn, PR, squash merge) + CI GitHub Actions (ruff, pytest) + Docker.

## Đã cân nhắc và bỏ
- Scrum: nhiều nghi thức, không có lợi khi làm một mình.
- MLOps đầy đủ (MLflow, drift monitoring): quá sớm khi chưa có model chạy thật.

## Hệ quả
- `main` luôn chạy được, CI chặn code lỗi trước khi merge.
- Khi team từ 5 người trở lên thì chuyển sang Scrum, thêm staging.