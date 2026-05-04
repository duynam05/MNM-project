import Icon from '../components/Icon'

function CreateUserPage({ onCancel }) {
  return (
    <>
      <div className="breadcrumb">
        <button type="button" onClick={onCancel}>
          Người dùng
        </button>
        <span>/</span>
        <strong>Thêm người dùng mới</strong>
      </div>

      <section className="hero-panel hero-panel--compact create-hero">
        <div>
          <h1>Tạo tài khoản hệ thống</h1>
          <p>Vui lòng cung cấp đầy đủ thông tin để thiết lập quyền truy cập cho nhân sự mới của Lumiere Books.</p>
        </div>
      </section>

      <section className="create-user-layout">
        <article className="card form-card user-form-card">
          <div className="form-grid form-grid--users">
            <label className="field field--with-icon">
              <span>Họ và tên</span>
              <div className="field-shell">
                <Icon name="users" />
                <input type="text" placeholder="Nguyễn Văn A" />
              </div>
            </label>

            <label className="field field--with-icon">
              <span>Vai trò hệ thống</span>
              <div className="field-shell field-shell--select">
                <Icon name="shield" />
                <select defaultValue="default">
                  <option value="default" disabled>
                    Chọn vai trò
                  </option>
                  <option>Quản trị viên</option>
                  <option>Quản lý kho</option>
                  <option>Biên tập viên</option>
                </select>
                <Icon name="arrowDown" />
              </div>
            </label>

            <label className="field field--with-icon">
              <span>Email công việc</span>
              <div className="field-shell">
                <Icon name="mail" />
                <input type="email" placeholder="example@lumiere.com" />
              </div>
            </label>

            <label className="field field--with-icon">
              <span>Mật khẩu khởi tạo</span>
              <div className="field-shell">
                <Icon name="lock" />
                <input type="password" placeholder="••••••••••" />
                <Icon name="info" />
              </div>
              <small>Mật khẩu nên chứa ít nhất 8 ký tự bao gồm chữ và số.</small>
            </label>

            <label className="field field--with-icon">
              <span>Số điện thoại</span>
              <div className="field-shell">
                <Icon name="phone" />
                <input type="text" placeholder="090 123 4567" />
              </div>
            </label>

            <div className="field">
              <span>Trạng thái tài khoản</span>
              <div className="radio-group">
                <label className="radio-option">
                  <input defaultChecked name="user-status" type="radio" />
                  <span>Hoạt động</span>
                </label>
                <label className="radio-option">
                  <input name="user-status" type="radio" />
                  <span>Bị khóa</span>
                </label>
              </div>
            </div>
          </div>

          <div className="user-create-footer">
            <div className="note-card">
              <div className="note-card__icon">
                <Icon name="note" />
              </div>
              <div>
                <strong>Ghi chú về quyền hạn</strong>
                <p>Khi chọn vai trò, các quyền truy cập tương ứng sẽ được áp dụng tự động. Bạn có thể tùy chỉnh chi tiết quyền hạn sau khi tài khoản được kích hoạt thành công.</p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card__icon">
                <Icon name="shield" />
              </div>
              <div>
                <strong>Bảo mật cao</strong>
                <p>Hệ thống mã hóa lớp bảo vệ dữ liệu nhân sự.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <div className="form-actions-bar">
        <button className="text-button" type="button" onClick={onCancel}>
          Hủy bỏ
        </button>
        <button className="primary-button" type="button">
          <Icon name="users" />
          Tạo tài khoản
        </button>
      </div>
    </>
  )
}

export default CreateUserPage
