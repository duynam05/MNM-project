import Icon from '../components/Icon'
import { quickOrderItems } from '../data/mockData'

function CreateOrderPage({ onCancel }) {
  return (
    <>
      <section className="hero-panel hero-panel--compact create-hero">
        <div>
          <h1>Tạo Đơn Hàng Mới</h1>
          <p>Lập hóa đơn và quản lý giao dịch khách hàng.</p>
        </div>
        <div className="hero-panel__actions">
          <button className="text-button" type="button" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button className="primary-button" type="button">
            <Icon name="clipboard" />
            Hoàn tất đơn hàng
          </button>
        </div>
      </section>

      <section className="order-create-layout">
        <div className="order-create-main">
          <article className="card form-card">
            <div className="section-title">
              <Icon name="users" />
              <h2>Thông tin khách hàng</h2>
            </div>
            <div className="form-grid form-grid--users">
              <label className="field field--with-icon">
                <span>Tìm kiếm khách hàng</span>
                <div className="field-shell">
                  <Icon name="search" />
                  <input type="text" placeholder="Tên, SĐT hoặc Email..." />
                </div>
              </label>

              <div className="field">
                <span>Khách hàng hiện tại</span>
                <div className="customer-chip">
                  <div className="user-avatar user-avatar--dark">LA</div>
                  <div className="user-cell__content">
                    <strong>Lê Minh Anh</strong>
                    <span>#KH-2048 • Thành viên Vàng</span>
                  </div>
                  <button className="ghost-icon-button" type="button" aria-label="Xóa khách hàng">
                    <Icon name="close" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="card form-card">
            <div className="card__header">
              <div className="section-title section-title--tight">
                <Icon name="book" />
                <h2>Sản phẩm &amp; Số lượng</h2>
              </div>
              <button className="text-button" type="button">
                + Thêm sách nhanh
              </button>
            </div>

            <div className="table-wrap">
              <table className="order-create-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá đơn vị</th>
                    <th>Số lượng</th>
                    <th>Tổng cộng</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {quickOrderItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="book-cell">
                          <div className={`book-thumb book-thumb--${item.coverTone}`} />
                          <div className="book-cell__content">
                            <strong>{item.title}</strong>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.unitPrice}</td>
                      <td>
                        <div className="quantity-control">
                          <button className="quantity-button" type="button">-</button>
                          <span>{item.quantity}</span>
                          <button className="quantity-button" type="button">+</button>
                        </div>
                      </td>
                      <td className="order-total">{item.total}</td>
                      <td>
                        <button className="ghost-icon-button" type="button" aria-label={`Xóa ${item.title}`}>
                          <Icon name="trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card form-card">
            <div className="section-title">
              <Icon name="file" />
              <h2>Ghi chú đơn hàng</h2>
            </div>
            <label className="field">
              <textarea placeholder="Ghi chú thêm về yêu cầu giao hàng, gói quà hoặc chiết khấu đặc biệt..." />
            </label>
          </article>
        </div>

        <aside className="order-create-side">
          <article className="card form-card">
            <div className="section-title">
              <Icon name="wallet" />
              <h2>Phương thức thanh toán</h2>
            </div>
            <div className="payment-options">
              <label className="payment-option payment-option--active">
                <input defaultChecked name="payment-method" type="radio" />
                <div>
                  <strong>Tiền mặt</strong>
                  <span>Thanh toán trực tiếp tại quầy</span>
                </div>
                <Icon name="wallet" />
              </label>
              <label className="payment-option">
                <input name="payment-method" type="radio" />
                <div>
                  <strong>Chuyển khoản / QR</strong>
                  <span>VietQR, Momo, ZaloPay</span>
                </div>
                <Icon name="chart" />
              </label>
              <label className="payment-option">
                <input name="payment-method" type="radio" />
                <div>
                  <strong>Thẻ tín dụng</strong>
                  <span>Visa, Mastercard, JCB</span>
                </div>
                <Icon name="clipboard" />
              </label>
            </div>
          </article>

          <article className="summary-card">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-row">
              <span>Tạm tính (3 sản phẩm)</span>
              <strong>679,000đ</strong>
            </div>
            <div className="summary-row">
              <span>Giảm giá (Thành viên)</span>
              <strong>-35,000đ</strong>
            </div>
            <div className="summary-row">
              <span>Thuế (VAT 8%)</span>
              <strong>51,520đ</strong>
            </div>
            <div className="summary-total">
              <span>Tổng tiền thanh toán</span>
              <strong>695,520đ</strong>
            </div>
            <button className="summary-card__button" type="button">In hóa đơn &amp; Lưu</button>
            <p className="summary-card__note">Mã hóa đơn sẽ được tạo tự động sau khi lưu.</p>
          </article>

          <div className="voucher-actions">
            <button className="toolbar-button" type="button">Áp dụng Voucher</button>
            <button className="toolbar-button" type="button">Gói quà miễn phí</button>
          </div>
        </aside>
      </section>
    </>
  )
}

export default CreateOrderPage
