# **TÀI LIỆU ĐẶC TẢ YÊU CẦU & KẾ HOẠCH TRIỂN KHAI WEB APP TÍNH CHẾ ĐỘ BHXH**

# **1\. Tổng quan Dự án & Mục tiêu**

* **Tên dự án:** Công cụ Tra cứu & Tính toán Chế độ BHXH Nhanh (Ốm đau \- Thai sản \- Dưỡng sức, phục hồi sức khỏe).  
* **Căn cứ pháp lý:** Luật Bảo hiểm xã hội số 41/2024/QH15 (áp dụng từ ngày 01/07/2025).  
* **Mục đích sử dụng:** Phục vụ đề xuất sáng kiến cải tiến nghiệp vụ BHXH và hỗ trợ cán bộ nhân sự, kế toán, người lao động tra cứu nhanh số ngày hưởng và mức trợ cấp chính xác, minh bạch.  
* **Phạm vi kỹ thuật (Tech Stack):**  
* **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.  
  * **Thư viện hỗ trợ:** `date-fns` (xử lý ngày tháng), `lucide-react` (biểu tượng giao diện).  
  * **Kiến trúc dữ liệu:** Xử lý 100% phía Client-side (Stateless), không lưu trữ cơ sở dữ liệu (Database) nhằm đảm bảo bảo mật thông tin người dùng, tốc độ phản hồi tức thì và chi phí vận hành bằng 0\.  
  * **Hạ tầng triển khai (Deployment):** Vercel (Free Tier), truy cập đa nền tảng (máy tính, điện thoại).

---

# **2\. Phân tích & Chuẩn hóa Nghiệp vụ BHXH (Business Rules)**

Điểm cốt lõi của hệ thống là tự động phân tách "Tổng số ngày theo lịch" và "Số ngày thực tế được hưởng" theo đúng 2 nhóm thuật toán tính ngày của Luật BHXH 41/2024/QH15, đồng thời kiểm tra các ngưỡng giới hạn (Cap) và điều kiện loại trừ.

## **2.1. Ma trận Phân loại Cách tính Ngày (Core Date Engine)**

Hệ thống phân nhánh tự động thành 2 nhóm thuật toán khi người dùng chọn chế độ:

* **Nhóm A \- Tính theo NGÀY LÀM VIỆC (Không tính ngày nghỉ hằng tuần, lễ, Tết):**  
  * **Áp dụng cho:** Chế độ Ốm đau (bản thân ốm, chăm con ốm dưới 7 tuổi, bệnh dài ngày); Chế độ Thai sản trường hợp Khám thai; Chế độ Thai sản trường hợp Lao động nam nghỉ khi vợ sinh con.  
  * **Công thức:** Số ngày hưởng \= Tổng ngày theo lịch \- Ngày nghỉ hằng tuần (Chủ nhật hoặc Thứ 7 & Chủ nhật theo lịch đơn vị) \- Ngày nghỉ lễ, Tết \- Ngày nghỉ phép/nghỉ việc riêng/nghỉ không hưởng lương trùng.  
  * **Quy tắc làm tròn nửa ngày (Điểm mới Luật 2024):** Áp dụng cho chế độ Ốm đau — nghỉ dưới nửa ngày tính 0,5 ngày; từ nửa ngày trở lên tính 1 ngày.  
* **Nhóm B \- Tính theo NGÀY LIÊN TỤC (Kể cả ngày nghỉ hằng tuần, lễ, Tết):**  
  * **Áp dụng cho:** Chế độ Thai sản trường hợp Sinh con, Sảy thai, phá thai, thai chết lưu, thực hiện biện pháp tránh thai; Chế độ Dưỡng sức, phục hồi sức khỏe (sau ốm đau và sau thai sản).  
  * **Công thức:** Số ngày hưởng \= Tổng số ngày liên tục trên lịch (tính cả ngày bắt đầu và ngày kết thúc).

## **2.2. Bảng Quy tắc Chi tiết 3 Chế độ**

| Chế độ & Phân loại | Quy tắc tính Số ngày & Mức trần tối đa | Công thức tính Tiền trợ cấp (VNĐ) | Quy tắc kiểm tra & Cảnh báo (Validation Rules) |
| :---- | :---- | :---- | :---- |
| **1\. Ốm đau** *(Bản thân ốm thông thường / Chăm con ốm dưới 7 tuổi / Bệnh dài ngày)* | **Tính theo ngày làm việc** (hỗ trợ lẻ 0,5 ngày).**Trần tối đa/năm:** 30/40/50 ngày (điều kiện bình thường) hoặc 40/50/70 ngày (nghề nặng nhọc, độc hại). Bệnh dài ngày kiểm tra theo danh mục bệnh quy định. | **(Tiền lương đóng BHXH tháng liền kề / 24\) x 75% x Số ngày hưởng.***(Ốm đau dài ngày quá 180 ngày hưởng mức 50% \- 65% tùy thời gian đóng BHXH).* | **Cấu hình lịch nghỉ:** Cho phép cấu hình lịch nghỉ tuần của đơn vị (Chỉ Chủ nhật hoặc Thứ 7 & Chủ nhật).**Cảnh báo:** Cảnh báo nếu vượt số ngày tối đa trong năm hoặc trùng ngày nghỉ phép/không lương. |
| **2\. Thai sản** | **Khám thai:** Tối đa 05 lần, mỗi lần không quá 02 ngày làm việc.**Sảy/phá thai/thai chết lưu:** 10 ngày (\< 5 tuần), 20 ngày (5 đến \< 13 tuần), 40 ngày (13 đến \< 22 tuần), 50 ngày (\>= 22 tuần) — tính ngày liên tục.**Sinh con:** 06 tháng (thêm 01 tháng/con từ con thứ 2\) — tính ngày liên tục.**Tránh thai:** tính ngày liên tục.**Nam nghỉ vợ sinh:** 05 \- 14 ngày làm việc tùy trường hợp. | **Sinh con:** (Mức bình quân tiền lương đóng BHXH 6 tháng liền kề) x Số tháng hưởng.**Các trường hợp khác:** (Lương BQ 6 tháng liền kề / 24\) x 100% x Số ngày hưởng. | **Tự động chuyển đổi thuật toán** giữa "Ngày làm việc" (Khám thai, Nam nghỉ vợ sinh) và "Ngày liên tục" (Sinh con, Sảy thai, Tránh thai).**Cảnh báo:** Cảnh báo nếu vượt trần từng trường hợp. |
| **3\. Dưỡng sức, PHSK (DSPHSK)** | **Tính ngày liên tục** (kể cả T7, CN, lễ, Tết).**Trần tối đa:** Sau ốm đau (10 ngày bệnh dài ngày; 07 ngày có phẫu thuật; 05 ngày trường hợp khác). Sau thai sản (10 ngày sinh từ 2 con trở lên; 07 ngày sinh phẫu thuật; 05 ngày trường hợp khác). | **Mức tham chiếu (Lương cơ sở) x 30% x Số ngày hưởng.***(Mức lương cơ sở hiện hành: 2.340.000đ/tháng tương đương 702.000đ/ngày).* | **Nguyên tắc cốt lõi:** Chỉ kê khai số ngày nghỉ thực tế được quyết định, không mặc nhiên tính tối đa.**Kiểm tra điều kiện:** Nghỉ trong vòng 30 ngày đầu kể từ ngày trở lại làm việc; cảnh báo nếu nhập quá số ngày trần (5/7/10 ngày). |

## **2.2. Quản lý Ngày Lễ, Tết Việt Nam**

* **Danh sách cố định:** Tích hợp sẵn các ngày nghỉ Lễ, Tết cố định theo Bộ luật Lao động (Tết Dương lịch 01/01, Giỗ Tổ Hùng Vương 10/03 ÂL, Ngày Chiến thắng 30/04, Quốc tế Lao động 01/05, Quốc khánh 02/09 và các ngày nghỉ liền kề).  
* **Tùy chỉnh linh hoạt:** Cho phép người dùng tùy chỉnh/bổ sung thêm các ngày nghỉ Tết Âm lịch hoặc ngày nghỉ bù đặc thù của từng năm/đơn vị.

---

# **3\. Thiết kế Giao diện & Trải nghiệm Người dùng (UI/UX Specification)**

Giao diện được thiết kế theo mô hình **Single-page Live Calculator** (tính toán trực tiếp theo thời gian thực ngay khi thay đổi dữ liệu, không cần tải lại trang), chia thành 2 khu vực chính trên màn hình máy tính (tự động xếp chồng 1 cột trên điện thoại):

## **3.1. Khu vực Nhập liệu (Cột bên trái \- Input Panel)**

1. **Bộ chọn Chế độ (Mode Selector):** 3 thẻ chọn (Radio Cards) trực quan gồm: **Ốm đau** \| **Thai sản** \| **Dưỡng sức, phục hồi sức khỏe**.  
2. **Thông tin định danh & Thời gian chung:**  
   * Họ và tên người lao động *(Tùy chọn, phục vụ hiển thị trên phiếu kết quả)*.  
   * Ngày bắt đầu nghỉ *(Định dạng dd/mm/yyyy, hỗ trợ chọn lịch và gõ phím trực tiếp)*.  
   * Ngày kết thúc nghỉ *(Định dạng dd/mm/yyyy)*.  
3. **Trường thông tin động theo từng chế độ (Dynamic Fields):**  
   * **Khi chọn Ốm đau:** Phân loại (Bản thân ốm thông thường / Chăm con ốm dưới 7 tuổi / Bệnh dài ngày), Lịch nghỉ hằng tuần (Chủ nhật / Thứ 7 & Chủ nhật), Tùy chọn tính lẻ nửa ngày (0,5 ngày), Số ngày trùng phép/nghỉ không lương, Số ngày đã nghỉ trong năm, Tiền lương làm căn cứ đóng BHXH tháng liền kề.  
   * **Khi chọn Thai sản:** Phân loại trường hợp (Khám thai / Sảy, phá thai, thai chết lưu / Sinh con / Thực hiện biện pháp tránh thai / Lao động nam nghỉ khi vợ sinh), Chi tiết điều kiện (Tuần tuổi thai / Sinh thường, sinh mổ, sinh đôi trở lên / Hình thức vợ sinh), Tiền lương bình quân 6 tháng liền kề.  
   * **Khi chọn Dưỡng sức:** Loại dưỡng sức (Sau ốm đau / Sau thai sản), Chi tiết trường hợp (Bệnh dài ngày / Có phẫu thuật / Sinh từ 2 con trở lên / Trường hợp khác), Ngày kết thúc đợt nghỉ hưởng chế độ trước đó.

## **3.2. Khu vực Hiển thị Kết quả (Cột bên phải \- Live Result Card)**

1. **Nhãn Chỉ báo Quy tắc Tính ngày (Rule Indicator Badge):**  
   * Hiển thị rõ ràng chế độ đang chọn áp dụng quy tắc **"Tính theo Ngày làm việc (trừ ngày nghỉ tuần & Lễ/Tết)"** hay **"Tính theo Ngày liên tục (bao gồm cả T7, CN & Lễ/Tết)"** để người dùng dễ hiểu và đối chiếu.  
2. **Thẻ Thống kê Số ngày (Day Breakdown):**  
   * **Hiển thị nổi bật:** Tổng số ngày theo lịch *(tính cả ngày đầu và ngày cuối)*.  
   * **Hiển thị kết quả chính:** Số ngày thực tế được hưởng chế độ BHXH.  
   * **Diễn giải chi tiết:** Liệt kê rõ số ngày bị loại trừ nếu tính theo ngày làm việc *(VD: Trừ 2 ngày Chủ nhật, trừ 1 ngày Lễ 30/04)*.  
3. **Thẻ Dự toán Tiền trợ cấp (Allowance Summary):**  
   * Hiển thị tổng số tiền trợ cấp ước tính *(định dạng tiền tệ VNĐ rõ ràng)*.  
   * Hiển thị công thức áp dụng minh bạch ngay bên dưới để người dùng dễ kiểm tra, đối chiếu.  
4. **Thẻ Cảnh báo & Trạng thái Nghiệp vụ (Validation Alert):**  
   * **Màu xanh lá:** Đủ điều kiện hưởng theo quy định hiện hành.  
   * **Màu vàng/đỏ:** Cảnh báo chi tiết nếu số ngày nghỉ vượt trần quy định *(VD: Vượt quá 5/7/10 ngày dưỡng sức, vượt mức tuổi thai)*, hoặc vi phạm điều kiện thời gian.  
5. **Tiện ích Hỗ trợ Nghiệp vụ:**  
   * Nút **"Sao chép kết quả"** *(Copy text định dạng đẹp để gửi qua Zalo/Email)*.  
   * Nút **"In / Xuất Phiếu tính (PDF)"** phục vụ lưu hồ sơ giấy hoặc trình ký.

---

# **4\. Kế hoạch Triển khai Kỹ thuật (Implementation Roadmap)**

Lộ trình phát triển tinh gọn để hoàn thiện bản Demo trong ngày:

* **Giai đoạn 1 \- Khởi tạo & Xây dựng Core Logic Engine (1.5 giờ):** Khởi tạo dự án Next.js (App Router) \+ Tailwind CSS. Xây dựng module xử lý thuật toán ngày tháng phân nhánh 2 nhóm (Ngày làm việc vs Ngày liên tục), hỗ trợ làm tròn 0,5 ngày ốm đau, lọc cuối tuần, lọc ngày lễ và kiểm tra trần ngày hưởng theo Luật BHXH 41/2024/QH15.  
* **Giai đoạn 2 \- Phát triển Giao diện Nhập liệu Động (1.5 giờ):** Xây dựng các component chọn chế độ, bộ chọn ngày tháng chuẩn định dạng Việt Nam (dd/mm/yyyy), định dạng nhập tiền tệ tự động phân tách hàng nghìn và hiển thị các trường nhập liệu động tương ứng.  
* **Giai đoạn 3 \- Tích hợp Bảng Kết quả & Nhãn Chỉ báo Quy tắc (1.0 giờ):** Kết nối dữ liệu tính toán real-time sang khu vực kết quả, hiển thị Rule Indicator Badge giải thích lý do tính/không tính T7-CN, bổ sung trích dẫn căn cứ pháp lý và tính năng sao chép/in phiếu tính.  
* **Giai đoạn 4 \- Kiểm thử Nghiệp vụ & Triển khai Vercel (0.5 giờ):** Chạy thử nghiệm các bộ dữ liệu mẫu (nghỉ ốm lẻ 0,5 ngày, nghỉ vắt qua tháng, nghỉ trùng ngày lễ, dưỡng sức vượt trần), tối ưu hiển thị trên thiết bị di động, đẩy mã nguồn lên GitHub và triển khai lên Vercel.

