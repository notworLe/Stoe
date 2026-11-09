
# Decision log
> File này là bộ nhớ quyết định của dự án. Đọc hết phần "CÁCH DÙNG FILE NÀY" và "ACTIVE RULES" trước mỗi phiên.
> Chỉ đọc phần HISTORY khi: (a) người dùng yêu cầu, hoặc (b) bạn sắp thay đổi thứ gì đã được nhắc trong ACTIVE RULES.

## CÁCH DÙNG FILE NÀY

1. Chỉ **ACTIVE RULES** là luật. PROPOSED và HISTORY không phải luật.
2. Bạn (agent) **chỉ được ghi vào PROPOSED**. Không tự sửa ACTIVE RULES hay HISTORY.
3. Chỉ người dùng được duyệt PROPOSED thành ACTIVE (người dùng nói rõ "duyệt D-xxx" hoặc "chốt").
4. Khi yêu cầu của người dùng mâu thuẫn với một luật ACTIVE: **dừng, nêu rõ luật nào (R-xx), hỏi lại**. Không tự chọn bên nào.
5. Khi không chắc một việc có thuộc luật nào không: hỏi, đừng đoán.

## CÁI GÌ ĐÁNG GHI

Ghi khi quyết định thỏa ít nhất một điều:
- Khó đảo ngược (xóa file, đổi schema, đổi cấu trúc thư mục, đổi tên hàng loạt)
- Ràng buộc công việc sau này (chọn thư viện, quy ước đặt tên, kiến trúc)
- Đã thử rồi bỏ (ghi lý do để khỏi thử lại)
- Người dùng sửa lỗi lặp lại của agent ("đã nói rồi, đừng làm X")

KHÔNG ghi: lựa chọn nhỏ, bấm nút nào, sửa typo, việc git commit đã ghi.

## ACTIVE RULES

> Tối đa 25 dòng. Mỗi luật: cụ thể, kiểm chứng được, kèm mã quyết định.

- R-01: Việc không thể đảo ngược (xóa file, đổi schema, ghi đè dữ liệu) → hỏi người dùng trước khi làm. (D-001)
- R-02: Quyết định mới do agent tự đưa ra → ghi vào PROPOSED với `by: agent`, không áp dụng như luật. (D-002)
- R-03: Khi chuyển/đổi tên file, cập nhật mọi nơi tham chiếu và báo lại danh sách đã sửa. (D-003)

## PROPOSED

> Chờ người dùng duyệt. Agent ghi vào đây theo đúng mẫu bên dưới.

(trống)

## HISTORY

> Mới nhất ở trên. Không xóa dòng nào, đổi ý thì chuyển status thành `superseded`.

### D-003 | 2026-11-08 | by: human | status: active
- Context: Agent chuyển file xong nhưng import cũ bị hỏng
- Decision: Đổi tên/chuyển file phải cập nhật mọi tham chiếu và báo lại
- Reason: Tránh lỗi âm thầm sau khi di chuyển
- Supersedes: none

### D-002 | 2026-11-08 | by: human | status: active
- Context: Agent tự quyết rồi làm như đã được duyệt
- Decision: Quyết định do agent đưa ra chỉ là đề xuất cho đến khi người dùng duyệt
- Reason: Phân biệt "người dùng đã chốt" với "agent tự đoán"
- Supersedes: none

### D-001 | 2026-11-08 | by: human | status: active
- Context: Cần chặn hành động phá hủy ngoài ý muốn
- Decision: Xóa file, đổi schema, ghi đè dữ liệu phải hỏi trước
- Reason: Không thể hoàn tác nếu sai
- Supersedes: none

## MẪU GHI MỚI

### D-xxx | YYYY-MM-DD HH:MM time | by: human | agent | human-approved | status: proposed | active | superseded | rejected
- Context: (vấn đề gì xảy ra)
- Decision: (quyết định, một câu cụ thể)
- Reason: (vì sao, để biết khi nào được phá luật)
- Supersedes: D-yyy hoặc none