import Icon from '../components/Icon'

function CreateBookPage({ onCancel }) {
  return (
    <div className="book-create-modern">
      <div className="books-modern__breadcrumb">Quản lý &nbsp;&gt;&nbsp; Sách &nbsp;&gt;&nbsp; Thêm sách mới</div>

      <section className="book-create-modern__hero">
        <div>
          <h1>Thêm Sách Mới</h1>
          <p>Cung cấp các chi tiết về ấn phẩm mới nhất của bạn để quản lý trong thư viện số của The Literary Curator.</p>
        </div>
      </section>

      <section className="book-create-modern__layout">
        <aside className="book-create-modern__cover">
          <div>
            <span className="book-create-modern__label">Ảnh bìa sách</span>
            <button className="book-create-modern__upload" type="button">
              <div className="book-create-modern__upload-icon">
                <Icon name="upload" />
              </div>
              <strong>Tải lên ảnh bìa</strong>
              <span>Hỗ trợ JPG, PNG (Tối đa 2MB)</span>
            </button>
          </div>
        </aside>

        <section className="book-create-modern__form card">
          <div className="book-create-modern__grid">
            <label className="field field--full">
              <span>Tên sách</span>
              <input type="text" placeholder="Nhập tiêu đề sách..." />
            </label>

            <label className="field">
              <span>Tác giả</span>
              <input type="text" placeholder="Tên tác giả..." />
            </label>

            <label className="field">
              <span>ISBN</span>
              <input type="text" placeholder="e.g. 978-3-16-148410-0" />
            </label>

            <label className="field">
              <span>Thể loại</span>
              <div className="field-shell field-shell--select">
                <select defaultValue="default">
                  <option value="default" disabled>
                    Chọn thể loại
                  </option>
                  <option>Văn học</option>
                  <option>Kỹ năng</option>
                  <option>Kinh tế</option>
                </select>
                <Icon name="arrowDown" />
              </div>
            </label>

            <label className="field">
              <span>Giá bán (VND)</span>
              <div className="field-shell">
                <input type="text" defaultValue="0" />
                <span className="book-create-modern__suffix">₫</span>
              </div>
            </label>

            <label className="field">
              <span>Số lượng tồn kho</span>
              <input type="text" defaultValue="0" />
            </label>

            <label className="field field--full">
              <span>Mô tả nội dung</span>
              <textarea placeholder="Tóm tắt nội dung sách và các thông tin nổi bật khác..." />
            </label>
          </div>

          <div className="book-create-modern__actions">
            <button className="text-button" type="button" onClick={onCancel}>
              Hủy bỏ
            </button>
            <button className="primary-button" type="button">
              <Icon name="clipboard" />
              Lưu thông tin
            </button>
          </div>
        </section>
      </section>
    </div>
  )
}

export default CreateBookPage
