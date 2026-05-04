import Icon from '../components/Icon'

const libraryBooks = [
  {
    title: 'Đại Gia Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: 'ISBN 978-3-16-148410-0',
    category: 'Văn học',
    price: '125.000đ',
    stock: 42,
    status: 'Còn hàng',
    statusTone: 'available',
    coverTone: 'night',
  },
  {
    title: 'Thay Đổi Tí Hon, Hiệu Quả Bất Ngờ',
    author: 'James Clear',
    isbn: 'ISBN 978-0-73-521129-2',
    category: 'Kỹ năng',
    price: '189.000đ',
    stock: 15,
    status: 'Sắp hết',
    statusTone: 'low',
    coverTone: 'forest',
  },
  {
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    isbn: 'ISBN 978-0-37-427563-1',
    category: 'Kinh tế',
    price: '250.000đ',
    stock: 0,
    status: 'Hết hàng',
    statusTone: 'out',
    coverTone: 'peach',
  },
  {
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    isbn: 'ISBN 978-0-06-112241-5',
    category: 'Văn học',
    price: '95.000đ',
    stock: 112,
    status: 'Còn hàng',
    statusTone: 'available',
    coverTone: 'blue',
  },
]

const bookSummary = [
  { title: 'Tổng đầu sách', value: '1,248', note: '+12% so với tháng trước', tone: 'blue' },
  { title: 'Giá trị kho hàng', value: '324.5M', note: 'VND (Giá bán lẻ)', tone: 'soft' },
]

function BooksPage({ onCreateBook }) {
  return (
    <div className="books-modern">
      <div className="books-modern__breadcrumb">TRANG CHỦ &nbsp;&gt;&nbsp; QUẢN LÝ SÁCH</div>

      <section className="books-modern__hero">
        <div>
          <h1>Thư viện Sách</h1>
          <p>Quản lý và cập nhật kho sách của hệ thống.</p>
        </div>
        <button className="primary-button" type="button" onClick={onCreateBook}>
          <Icon name="plus" />
          Thêm sách mới
        </button>
      </section>

      <section className="books-modern__toolbar">
        <div className="books-filter-group">
          <button className="books-filter" type="button">
            <Icon name="filter" />
            Bộ lọc
          </button>
          <button className="books-filter" type="button">
            Tất cả danh mục
            <Icon name="arrowDown" />
          </button>
          <button className="books-filter" type="button">
            Trạng thái kho
            <Icon name="arrowDown" />
          </button>
        </div>
        <button className="books-refresh" type="button">
          <Icon name="info" />
          Làm mới
        </button>
      </section>

      <section className="books-table-card">
        <div className="table-wrap">
          <table className="books-table">
            <thead>
              <tr>
                <th>Sách</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {libraryBooks.map((book) => (
                <tr key={book.title}>
                  <td>
                    <div className="book-cell">
                      <div className={`book-thumb book-thumb--${book.coverTone}`} />
                      <div className="book-cell__content">
                        <strong>{book.title}</strong>
                        <span>{book.author}</span>
                        <span>{book.isbn}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="books-tag">{book.category}</span>
                  </td>
                  <td className="books-table__price">{book.price}</td>
                  <td>{book.stock}</td>
                  <td>
                    <span className={`books-status books-status--${book.statusTone}`}>{book.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="ghost-icon-button" type="button" aria-label={`Sửa ${book.title}`}>
                        <Icon name="edit" />
                      </button>
                      <button className="ghost-icon-button" type="button" aria-label={`Xóa ${book.title}`}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="books-table-card__footer">
          <p>Hiển thị 1 - 4 của 124 đầu sách</p>
          <div className="pagination">
            <button className="pagination__button" type="button">
              <Icon name="chevronLeft" />
            </button>
            <button className="pagination__page pagination__page--active" type="button">1</button>
            <button className="pagination__page" type="button">2</button>
            <button className="pagination__page" type="button">3</button>
            <span className="pagination__ellipsis">...</span>
            <button className="pagination__page" type="button">31</button>
            <button className="pagination__button" type="button">
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>
      </section>

      <section className="books-summary">
        {bookSummary.map((item) => (
          <article className={`books-summary__card books-summary__card--${item.tone}`} key={item.title}>
            <p>{item.title}</p>
            <strong>{item.value}</strong>
            <span>{item.note}</span>
          </article>
        ))}
      </section>
    </div>
  )
}

export default BooksPage
